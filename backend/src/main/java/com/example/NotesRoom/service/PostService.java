package com.example.NotesRoom.service;

import com.example.NotesRoom.dto.post.*;
import com.example.NotesRoom.entity.*;
import com.example.NotesRoom.repository.PostCommentRepository;
import com.example.NotesRoom.repository.PostLikeRepository;
import com.example.NotesRoom.repository.PostRepository;
import com.example.NotesRoom.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final PostCommentRepository postCommentRepository;
    private final PostLikeRepository postLikeRepository;

    @Transactional
    public PostDto createPost(
            String clerkId,
            CreatePostDto dto
    ) throws IOException {
        Users user = userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
        if (dto.description() == null ||
                dto.description().isBlank()) {
            throw new IllegalArgumentException("Post description cannot be empty");
        }
        if (dto.category() == null) {
            throw new IllegalArgumentException("Post category is required");
        }

        MediaType mediaType = null;
        if (dto.mediaType() != null && !dto.mediaType().isBlank()) {
            try {
                mediaType = MediaType.valueOf(
                        dto.mediaType().toUpperCase()
                );
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException(
                        "Invalid media type. Use IMAGE or VIDEO"
                );
            }
        }


        Post post = Post.builder()
                .user(user)
                .description(dto.description().trim())
                .category(dto.category())
                .mediaUrl(dto.mediaUrl())
                .mediaType(mediaType)
                .createdAt(Instant.now())
                .build();
        Post savedPost = postRepository.save(post);

        return toDto(savedPost, user);
    }

    @Transactional
    public Page<PostDto> getPosts(String clerkId, Pageable pageable) {
        Users user = userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
        return postRepository
                .findAllByOrderByCreatedAtDesc(pageable)
                .map(post -> toDto(post, user));
    }

    @Transactional
    public Page<PostDto> getMyPosts(
            String clerkId,
            Pageable pageable
    ) {
        Users user = userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
        return postRepository
                .findByUserOrderByCreatedAtDesc(user, pageable)
                .map(post -> toDto(post, user));
    }

    @Transactional
    public PostDto updatePost(
            String clerkId,
            Long postId,
            CreatePostDto dto,
            MultipartFile media,
            boolean removeMedia
    ) throws IOException {
        Users user = userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository
                .findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        // Only owner can edit
        if (!post.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You cannot edit this post");
        }
        // Validate description
        if (dto.description() == null || dto.description().isBlank()) {
            throw new IllegalArgumentException("Post description cannot be empty");
        }
        // Validate category
        if (dto.category() == null) {
            throw new IllegalArgumentException("Post category is required");
        }
        post.setDescription(dto.description().trim());
        post.setCategory(dto.category());
        String oldMediaUrl = post.getMediaUrl();
        MediaType oldMediaType = post.getMediaType();
        /*
         * Case 1:
         * User selected new media.
         */
        if (media != null && !media.isEmpty()) {
            String contentType = media.getContentType();
            if (contentType == null) {
                throw new IllegalArgumentException("Unable to determine media type");
            }
            String newMediaUrl;
            MediaType newMediaType;
            if (contentType.startsWith("image/")) {
                newMediaUrl =
                        cloudinaryService.uploadPostImage(media);
                newMediaType = MediaType.IMAGE;
            } else if (contentType.startsWith("video/")) {
                newMediaUrl = cloudinaryService.uploadPostVideo(media);
                newMediaType = MediaType.VIDEO;
            } else {
                throw new IllegalArgumentException("Only image and video files are allowed");
            }
            post.setMediaUrl(newMediaUrl);
            post.setMediaType(newMediaType);
            // Delete old media from Cloudinary
            if (oldMediaUrl != null && !oldMediaUrl.isBlank()) {
                cloudinaryService.deletePostMedia(
                        oldMediaUrl,
                        oldMediaType != null
                                ? oldMediaType.name()
                                : "IMAGE"
                );
            }
        }
        /*
         * Case 2:
         * User clicked "Remove media".
         */
        else if (removeMedia) {
            post.setMediaUrl(null);
            post.setMediaType(null);
            if (oldMediaUrl != null && !oldMediaUrl.isBlank()) {
                cloudinaryService.deletePostMedia(
                        oldMediaUrl,
                        oldMediaType != null
                                ? oldMediaType.name()
                                : "IMAGE"
                );
            }
        }
        post.setUpdatedAt(Instant.now());
        Post savedPost = postRepository.save(post);

        return toDto(savedPost, user);
    }

    @Transactional
    public void deletePost(
            String clerkId,
            Long postId
    ) {
        Users user = userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
        Post post = postRepository
                .findById(postId)
                .orElseThrow(() ->
                        new RuntimeException("Post not found"));
        if (!post.getUser().getId()
                .equals(user.getId())) {
            throw new RuntimeException("You cannot delete this post");
        }

        // Delete post image from Cloudinary
        if (post.getMediaUrl() != null &&
                !post.getMediaUrl().isBlank()) {

            try {
                cloudinaryService.deletePostMedia(
                        post.getMediaUrl(),
                        post.getMediaType() != null
                                ? post.getMediaType().name()
                                : "IMAGE"
                );
            } catch (IOException e) {
                throw new RuntimeException(
                        "Failed to delete post media",
                        e
                );
            }
        }

        postRepository.delete(post);
    }

    @Transactional
    public void likePost(
            String clerkId,
            Long postId
    ) {
        Users user = userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Post post = postRepository
                .findById(postId)
                .orElseThrow(() ->
                        new RuntimeException("Post not found"));

        boolean alreadyLiked =
                postLikeRepository.existsByPostAndUser(
                        post,
                        user
                );

        if (alreadyLiked) {
            return;
        }

        PostLike like = PostLike.builder()
                .post(post)
                .user(user)
                .createdAt(LocalDateTime.now())
                .build();

        postLikeRepository.save(like);
    }

    @Transactional
    public void unlikePost(
            String clerkId,
            Long postId
    ) {
        Users user = userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Post post = postRepository
                .findById(postId)
                .orElseThrow(() ->
                        new RuntimeException("Post not found"));

        postLikeRepository.deleteByPostAndUser(
                post,
                user
        );
    }

    @Transactional
    public CommentDto addComment(
            String clerkId,
            Long postId,
            CreateCommentDto dto
    ) {
        Users user = userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Post post = postRepository
                .findById(postId)
                .orElseThrow(() ->
                        new RuntimeException("Post not found"));

        if (dto.content() == null ||
                dto.content().isBlank()) {

            throw new IllegalArgumentException(
                    "Comment cannot be empty"
            );
        }

        PostComment comment = PostComment.builder()
                .post(post)
                .user(user)
                .content(dto.content().trim())
                .createdAt(LocalDateTime.now())
                .build();

        PostComment saved =
                postCommentRepository.save(comment);

        return toCommentDto(saved);
    }

    @Transactional
    public List<CommentDto> getComments(
            Long postId
    ) {
        Post post = postRepository
                .findById(postId)
                .orElseThrow(() ->
                        new RuntimeException("Post not found"));

        return postCommentRepository
                .findByPostOrderByCreatedAtAsc(post)
                .stream()
                .map(this::toCommentDto)
                .toList();
    }

    @Transactional
    public void deleteComment(
            String clerkId,
            Long commentId
    ) {
        Users user = userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        PostComment comment =
                postCommentRepository
                        .findById(commentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Comment not found"
                                ));

        if (!comment.getUser().getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You cannot delete this comment"
            );
        }

        postCommentRepository.delete(comment);
    }

    private CommentDto toCommentDto(
            PostComment comment
    ) {
        Users user = comment.getUser();

        Profile profile = user.getProfile();

        return new CommentDto(
                comment.getId(),
                user.getId(),
                profile != null
                        ? profile.getFullName()
                        : null,
                profile != null
                        ? profile.getUsername()
                        : null,
                profile != null
                        ? profile.getProfileImage()
                        : null,
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }

    private PostDto toDto(
            Post post,
            Users currentUser
    ) {
        Users user = post.getUser();

        Profile profile = user.getProfile();

        long likeCount =
                postLikeRepository.countByPost(post);

        boolean likedByMe =
                currentUser != null &&
                        postLikeRepository.existsByPostAndUser(
                                post,
                                currentUser
                        );

        long commentCount =
                postCommentRepository.countByPost(post);

        return new PostDto(
                post.getId(),
                user.getId(),

                profile != null
                        ? profile.getId()
                        : null,

                profile != null
                        ? profile.getFullName()
                        : null,

                profile != null
                        ? profile.getUsername()
                        : null,

                profile != null
                        ? profile.getProfileImage()
                        : null,

                post.getDescription(),
                post.getCategory(),
                post.getMediaUrl(),
                post.getMediaType(),
                post.getCreatedAt(),
                post.getUpdatedAt(),

                likeCount,
                likedByMe,
                commentCount
        );
    }
}
package com.example.NotesRoom.service;

import com.example.NotesRoom.dto.post.CommentDto;
import com.example.NotesRoom.dto.post.CreateCommentDto;
import com.example.NotesRoom.dto.post.CreatePostDto;
import com.example.NotesRoom.dto.post.PostDto;
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

        String imageUrl = dto.imageUrl();

        Post post = Post.builder()
                .user(user)
                .description(dto.description().trim())
                .category(dto.category())
                .imageUrl(imageUrl)
                .createdAt(LocalDateTime.now())
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
            MultipartFile image,
            boolean removeImage
    ) throws IOException {
        Users user = userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
        Post post = postRepository
                .findById(postId)
                .orElseThrow(() ->
                        new RuntimeException("Post not found"));
        // Only owner can edit
        if (!post.getUser().getId()
                .equals(user.getId())) {
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
        String oldImage = post.getImageUrl();
        /*
         * Case 1:
         * User selected a new image.
         *
         * Replace the old image with the new one.
         */
        if (image != null && !image.isEmpty()) {
            String newImage = cloudinaryService.uploadPostImage(image);
            post.setImageUrl(newImage);
            // Delete old image from Cloudinary
            if (oldImage != null && !oldImage.isBlank()) {
                cloudinaryService.deletePostImage(
                        oldImage
                );
            }
        }
        /*
         * Case 2:
         * User clicked "Remove image".
         *
         * Only remove the image if there is
         * no replacement image being uploaded.
         */
        else if (removeImage) {
            post.setImageUrl(null);
            if (oldImage != null &&
                    !oldImage.isBlank()) {
                cloudinaryService.deletePostImage(
                        oldImage
                );
            }
        }
        post.setUpdatedAt(LocalDateTime.now());
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
        if (post.getImageUrl() != null &&
                !post.getImageUrl().isBlank()) {
            try {
                cloudinaryService.deleteProfileImage(post.getImageUrl());
            } catch (IOException e) {
                throw new RuntimeException("Failed to delete post image", e);
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
                post.getImageUrl(),
                post.getCreatedAt(),
                post.getUpdatedAt(),

                likeCount,
                likedByMe,
                commentCount
        );
    }
}
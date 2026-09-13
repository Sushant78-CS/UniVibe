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

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final PostCommentRepository postCommentRepository;
    private final PostLikeRepository postLikeRepository;


    // =========================================================
    // CREATE POST
    // =========================================================

    @Transactional
    public PostDto createPost(
            String clerkId,
            CreatePostDto dto
    ) throws IOException {

        Users user = userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        validatePost(dto);

        Post post = Post.builder()
                .user(user)
                .description(dto.description().trim())
                .category(dto.category())
                .createdAt(Instant.now())
                .build();

        addMediaToPost(post, dto.media());

        Post savedPost = postRepository.save(post);

        return toDto(savedPost, user);
    }


    // =========================================================
    // GET ALL POSTS
    // =========================================================

    @Transactional
    public Page<PostDto> getPosts(
            String clerkId,
            Pageable pageable
    ) {

        Users user = userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return postRepository
                .findAllByOrderByCreatedAtDesc(pageable)
                .map(post -> toDto(post, user));
    }


    // =========================================================
    // GET MY POSTS
    // =========================================================

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

    // =========================================================
// GET POST BY ID
// =========================================================

    @Transactional
    public PostDto getPostById(
            String clerkId,
            Long postId
    ) {

        // Get authenticated user
        Users user = userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        // Get post
        Post post = postRepository
                .findById(postId)
                .orElseThrow(() ->
                        new RuntimeException("Post not found")
                );

        // Convert to DTO
        //
        // Using the authenticated user here is important
        // because PostDto contains user-specific information
        // such as likedByMe.
        return toDto(post, user);
    }


    // =========================================================
    // UPDATE POST
    // =========================================================

    @Transactional
    public PostDto updatePost(
            String clerkId,
            Long postId,
            CreatePostDto dto,
            boolean removeMedia
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
        if (!post.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "You cannot edit this post"
            );
        }

        validatePost(dto);

        // Update text/category
        post.setDescription(dto.description().trim());
        post.setCategory(dto.category());


        // =====================================================
        // REPLACE MEDIA
        // =====================================================

        if (dto.media() != null && !dto.media().isEmpty()) {

            updatePostMedia(post, dto.media());
        }

        // =====================================================
        // REMOVE MEDIA
        // =====================================================

        else if (removeMedia) {

            deletePostMediaFromCloudinary(post);

            post.getMedia().clear();
        }


        post.setUpdatedAt(Instant.now());

        Post savedPost = postRepository.save(post);

        return toDto(savedPost, user);
    }


    // =========================================================
    // DELETE POST
    // =========================================================

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

            throw new RuntimeException(
                    "You cannot delete this post"
            );
        }


        // Delete ALL media from Cloudinary
        deletePostMediaFromCloudinary(post);

        // Cascade + orphanRemoval handles PostMedia,
        // likes and comments.
        postRepository.delete(post);
    }


    // =========================================================
    // LIKE POST
    // =========================================================

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


    // =========================================================
    // UNLIKE POST
    // =========================================================

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


    // =========================================================
    // ADD COMMENT
    // =========================================================

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
                .createdAt(Instant.now())
                .build();

        PostComment saved =
                postCommentRepository.save(comment);

        return toCommentDto(saved, user);
    }


    // =========================================================
    // GET COMMENTS
    // =========================================================

    @Transactional
    public List<CommentDto> getComments(
            String clerkId,
            Long postId
    ) {

        Users currentUser = userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Post post = postRepository
                .findById(postId)
                .orElseThrow(() ->
                        new RuntimeException("Post not found"));

        return postCommentRepository
                .findByPostOrderByCreatedAtAsc(post)
                .stream()
                .map(comment ->
                        toCommentDto(
                                comment,
                                currentUser
                        )
                )
                .toList();
    }


    // =========================================================
    // DELETE COMMENT
    // =========================================================

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


    // =========================================================
    // ADD MEDIA TO POST
    // =========================================================

    private void addMediaToPost(
            Post post,
            List<PostMediaDto> mediaDtos
    ) {

        if (mediaDtos == null ||
                mediaDtos.isEmpty()) {
            return;
        }

        int order = post.getMedia().size();

        for (PostMediaDto mediaDto : mediaDtos) {

            if (mediaDto == null) {
                continue;
            }

            if (mediaDto.mediaUrl() == null ||
                    mediaDto.mediaUrl().isBlank()) {
                continue;
            }

            if (mediaDto.mediaType() == null) {
                throw new IllegalArgumentException(
                        "Media type is required"
                );
            }

            PostMedia media = PostMedia.builder()
                    .post(post)
                    .mediaUrl(mediaDto.mediaUrl().trim())
                    .mediaType(mediaDto.mediaType())
                    .displayOrder(order++)
                    .build();

            // Maintain the bidirectional relationship
            media.setPost(post);

            // IMPORTANT:
            // Add to Hibernate's existing managed collection.
            // Do NOT call post.setMedia(...)
            post.getMedia().add(media);
        }
    }

    private void updatePostMedia(
            Post post,
            List<PostMediaDto> mediaDtos
    ) throws IOException {

        if (mediaDtos == null || mediaDtos.isEmpty()) {
            return;
        }

        /*
         * Keep a snapshot of the existing managed collection.
         * We must NOT replace post.media with a new List because
         * it is a Hibernate orphanRemoval collection.
         */
        List<PostMedia> existingMedia =
                new ArrayList<>(post.getMedia());

        /*
         * Normalize incoming URLs and determine which existing
         * Cloudinary assets are still being used.
         */
        List<String> incomingUrls = new ArrayList<>();

        for (PostMediaDto mediaDto : mediaDtos) {

            if (mediaDto == null) {
                continue;
            }

            if (mediaDto.mediaUrl() == null ||
                    mediaDto.mediaUrl().isBlank()) {
                continue;
            }

            incomingUrls.add(
                    mediaDto.mediaUrl().trim()
            );
        }

        /*
         * Delete ONLY media that existed before but is no longer
         * present in the edited post.
         */
        for (PostMedia existing : existingMedia) {

            String existingUrl = existing.getMediaUrl();

            if (existingUrl == null ||
                    existingUrl.isBlank()) {
                continue;
            }

            String normalizedExistingUrl =
                    existingUrl.trim();

            if (!incomingUrls.contains(
                    normalizedExistingUrl
            )) {

                cloudinaryService.deletePostMedia(
                        normalizedExistingUrl,
                        existing.getMediaType() != null
                                ? existing.getMediaType().name()
                                : "IMAGE"
                );
            }
        }

        /*
         * Remove only the PostMedia database entities that
         * are no longer present.
         *
         * We remove through the existing managed collection
         * so Hibernate orphanRemoval works correctly.
         */
        post.getMedia().removeIf(existing -> {

            String existingUrl =
                    existing.getMediaUrl();

            return existingUrl == null ||
                    !incomingUrls.contains(
                            existingUrl.trim()
                    );
        });

        /*
         * Build a lookup of the media that is still attached
         * to this post.
         */
        java.util.Map<String, PostMedia> existingByUrl =
                new java.util.HashMap<>();

        for (PostMedia existing : post.getMedia()) {

            if (existing.getMediaUrl() == null) {
                continue;
            }

            existingByUrl.put(
                    existing.getMediaUrl().trim(),
                    existing
            );
        }

        /*
         * Add new media and update ordering/type of existing media.
         */
        int order = 0;

        for (PostMediaDto mediaDto : mediaDtos) {

            if (mediaDto == null ||
                    mediaDto.mediaUrl() == null ||
                    mediaDto.mediaUrl().isBlank()) {
                continue;
            }

            String mediaUrl =
                    mediaDto.mediaUrl().trim();

            PostMedia existing =
                    existingByUrl.get(mediaUrl);

            if (existing != null) {

                // Existing media is being kept.
                existing.setMediaType(
                        mediaDto.mediaType()
                );

                existing.setDisplayOrder(
                        mediaDto.displayOrder() != null
                                ? mediaDto.displayOrder()
                                : order
                );

            } else {

                // New media uploaded during this edit.
                PostMedia newMedia =
                        PostMedia.builder()
                                .post(post)
                                .mediaUrl(mediaUrl)
                                .mediaType(mediaDto.mediaType())
                                .displayOrder(
                                        mediaDto.displayOrder() != null
                                                ? mediaDto.displayOrder()
                                                : order
                                )
                                .build();

                post.getMedia().add(newMedia);
            }

            order++;
        }
    }

    // =========================================================
    // DELETE MEDIA FROM CLOUDINARY
    // =========================================================

    private void deletePostMediaFromCloudinary(
            Post post
    ) {

        if (post.getMedia() == null ||
                post.getMedia().isEmpty()) {

            return;
        }

        for (PostMedia media : post.getMedia()) {

            if (media.getMediaUrl() == null ||
                    media.getMediaUrl().isBlank()) {

                continue;
            }

            try {

                cloudinaryService.deletePostMedia(
                        media.getMediaUrl(),
                        media.getMediaType() != null
                                ? media.getMediaType().name()
                                : "IMAGE"
                );

            } catch (IOException e) {

                throw new RuntimeException(
                        "Failed to delete post media",
                        e
                );
            }
        }
    }


    // =========================================================
    // VALIDATE POST
    // =========================================================

    private void validatePost(
            CreatePostDto dto
    ) {

        if (dto == null) {
            throw new IllegalArgumentException(
                    "Post data is required"
            );
        }

        if (dto.description() == null ||
                dto.description().isBlank()) {

            throw new IllegalArgumentException(
                    "Post description cannot be empty"
            );
        }

        if (dto.category() == null) {

            throw new IllegalArgumentException(
                    "Post category is required"
            );
        }

        if (dto.media() == null ||
                dto.media().isEmpty()) {

            return;
        }

        for (PostMediaDto media : dto.media()) {

            if (media == null) {
                continue;
            }

            if (media.mediaUrl() == null ||
                    media.mediaUrl().isBlank()) {

                throw new IllegalArgumentException(
                        "Media URL cannot be empty"
                );
            }

            if (media.mediaType() == null) {

                throw new IllegalArgumentException(
                        "Media type is required"
                );
            }
        }
    }


    // =========================================================
    // COMMENT DTO
    // =========================================================

    private CommentDto toCommentDto(
            PostComment comment,
            Users currentUser
    ) {

        Users user = comment.getUser();

        Profile profile = user.getProfile();

        boolean isOwner =
                currentUser != null &&
                        user.getId()
                                .equals(currentUser.getId());

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
                comment.getUpdatedAt(),
                isOwner
        );
    }


    // =========================================================
    // POST DTO
    // =========================================================

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


        List<PostMediaDto> media =
                post.getMedia()
                        .stream()
                        .map(postMedia ->
                                new PostMediaDto(
                                        postMedia.getMediaUrl(),
                                        postMedia.getMediaType(),
                                        postMedia.getDisplayOrder()
                                )
                        )
                        .toList();


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
                media,
                post.getCreatedAt(),
                post.getUpdatedAt(),

                likeCount,
                likedByMe,
                commentCount
        );
    }
}
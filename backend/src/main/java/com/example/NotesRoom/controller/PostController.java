package com.example.NotesRoom.controller;

import com.example.NotesRoom.dto.post.CommentDto;
import com.example.NotesRoom.dto.post.CreateCommentDto;
import com.example.NotesRoom.dto.post.CreatePostDto;
import com.example.NotesRoom.dto.post.PostDto;
import com.example.NotesRoom.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;


    // =========================================================
    // CREATE POST
    // =========================================================

    @PostMapping
    public ResponseEntity<PostDto> createPost(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody CreatePostDto dto
    ) throws IOException {

        String clerkId = jwt.getSubject();

        return ResponseEntity.ok(
                postService.createPost(
                        clerkId,
                        dto
                )
        );
    }


    // =========================================================
    // GET ALL POSTS
    // =========================================================

    @GetMapping
    public ResponseEntity<Page<PostDto>> getPosts(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        String clerkId = jwt.getSubject();

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Order.desc("createdAt"),
                        Sort.Order.desc("id")
                )
        );

        return ResponseEntity.ok(
                postService.getPosts(
                        clerkId,
                        pageable
                )
        );
    }


    // =========================================================
    // GET MY POSTS
    // =========================================================

    @GetMapping("/mine")
    public ResponseEntity<Page<PostDto>> getMyPosts(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        String clerkId = jwt.getSubject();

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Order.desc("createdAt"),
                        Sort.Order.desc("id")
                )
        );

        return ResponseEntity.ok(
                postService.getMyPosts(
                        clerkId,
                        pageable
                )
        );
    }


    // =========================================================
    // UPDATE POST
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<PostDto> updatePost(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @RequestBody CreatePostDto dto,
            @RequestParam(defaultValue = "false") boolean removeMedia
    ) throws IOException {

        String clerkId = jwt.getSubject();

        return ResponseEntity.ok(
                postService.updatePost(
                        clerkId,
                        id,
                        dto,
                        removeMedia
                )
        );
    }


    // =========================================================
    // DELETE POST
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id
    ) {

        String clerkId = jwt.getSubject();

        postService.deletePost(
                clerkId,
                id
        );

        return ResponseEntity.noContent()
                .build();
    }


    // =========================================================
    // LIKE POST
    // =========================================================

    @PostMapping("/{id}/like")
    public ResponseEntity<Void> likePost(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id
    ) {

        postService.likePost(
                jwt.getSubject(),
                id
        );

        return ResponseEntity.ok()
                .build();
    }


    // =========================================================
    // UNLIKE POST
    // =========================================================

    @DeleteMapping("/{id}/like")
    public ResponseEntity<Void> unlikePost(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id
    ) {

        postService.unlikePost(
                jwt.getSubject(),
                id
        );

        return ResponseEntity.noContent()
                .build();
    }


    // =========================================================
    // GET COMMENTS
    // =========================================================

    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<CommentDto>> getComments(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long postId
    ) {

        String clerkId = jwt.getSubject();

        return ResponseEntity.ok(
                postService.getComments(
                        clerkId,
                        postId
                )
        );
    }


    // =========================================================
    // ADD COMMENT
    // =========================================================

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentDto> addComment(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @RequestBody CreateCommentDto dto
    ) {

        return ResponseEntity.ok(
                postService.addComment(
                        jwt.getSubject(),
                        id,
                        dto
                )
        );
    }


    // =========================================================
    // DELETE COMMENT
    // =========================================================

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long commentId
    ) {

        postService.deleteComment(
                jwt.getSubject(),
                commentId
        );

        return ResponseEntity.noContent()
                .build();
    }
}
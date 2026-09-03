package com.example.NotesRoom.dto.post;


import java.time.LocalDateTime;

public record PostDto(
        Long id,
        Long userId,
        Long profileId,
        String fullName,
        String username,
        String profileImage,
        String description,
        PostCategory category,
        String mediaUrl,
        MediaType mediaType,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,

        long likeCount,
        boolean likedByMe,
        long commentCount
) {
}
package com.example.NotesRoom.dto.post;


import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

public record PostDto(
        Long id,
        Long userId,
        Long profileId,
        String fullName,
        String username,
        String profileImage,
        String description,
        PostCategory category,
        List<PostMediaDto> media,
        Instant createdAt,
        Instant updatedAt,
        long likeCount,
        boolean likedByMe,
        long commentCount
) {
}
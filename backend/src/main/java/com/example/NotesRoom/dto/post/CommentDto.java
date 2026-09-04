package com.example.NotesRoom.dto.post;

import java.time.Instant;

public record CommentDto(
        Long id,
        Long userId,
        String fullName,
        String username,
        String profileImage,
        String content,
        Instant createdAt,
        Instant updatedAt,
        boolean isOwner
) {
}
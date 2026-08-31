package com.example.NotesRoom.dto.post;

import java.time.LocalDateTime;

public record CommentDto(
        Long id,
        Long userId,
        String fullName,
        String username,
        String profileImage,
        String content,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}

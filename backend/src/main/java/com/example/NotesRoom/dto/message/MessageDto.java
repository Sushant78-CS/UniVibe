package com.example.NotesRoom.dto.message;

import java.time.Instant;
import java.time.LocalDateTime;

public record MessageDto(
        Long id,
        Long conversationId,
        Long senderId,
        String senderName,
        String senderUsername,
        String senderProfileImage,
        String content,
        Instant createdAt,
        Boolean read
) {
}
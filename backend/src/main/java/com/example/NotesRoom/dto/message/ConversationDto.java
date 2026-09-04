package com.example.NotesRoom.dto.message;

import java.time.Instant;
import java.time.LocalDateTime;

public record ConversationDto(
        Long id,

        Long otherUserId,
        String otherUserName,
        String otherUsername,
        String otherProfileImage,

        String lastMessage,
        Instant lastMessageAt,

        Long unreadCount,

        Instant updatedAt
) {
}

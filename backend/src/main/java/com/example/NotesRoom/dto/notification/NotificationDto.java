package com.example.NotesRoom.dto.notification;

import java.time.LocalDateTime;

public record NotificationDto(
        Long id,

        NotificationType type,

        String message,

        Long referenceId,

        Long actorId,

        String actorName,

        String actorUsername,

        String actorProfileImage,

        boolean read,

        LocalDateTime createdAt
) {
}

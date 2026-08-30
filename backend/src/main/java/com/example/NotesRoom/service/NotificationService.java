package com.example.NotesRoom.service;

import com.example.NotesRoom.dto.notification.NotificationDto;
import com.example.NotesRoom.dto.notification.NotificationType;
import com.example.NotesRoom.entity.Notification;
import com.example.NotesRoom.entity.Users;
import com.example.NotesRoom.repository.NotificationRepository;
import com.example.NotesRoom.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * Create a notification.
     */
    @Transactional
    public Notification createNotification(
            Users recipient,
            Users actor,
            NotificationType type,
            String message,
            Long referenceId
    ) {

        Notification notification = Notification.builder()
                .user(recipient)
                .actor(actor)
                .type(type)
                .message(message)
                .referenceId(referenceId)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        return notificationRepository.save(notification);
    }

    /**
     * Get all notifications for current user.
     */
    @Transactional(readOnly = true)
    public List<NotificationDto> getNotifications(
            String clerkId
    ) {

        Users user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        return notificationRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * Get unread notification count.
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(
            String clerkId
    ) {

        Users user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        return notificationRepository
                .countByUserAndReadFalse(user);
    }

    /**
     * Mark one notification as read.
     */
    @Transactional
    public void markAsRead(
            String clerkId,
            Long notificationId
    ) {

        Users user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Notification notification =
                notificationRepository.findById(notificationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification not found"
                                )
                        );

        if (!notification.getUser().getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "Unauthorized notification access"
            );
        }

        notification.setRead(true);

        notificationRepository.save(notification);
    }

    /**
     * Mark all notifications as read.
     */
    @Transactional
    public void markAllAsRead(
            String clerkId
    ) {

        Users user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        List<Notification> notifications =
                notificationRepository
                        .findByUserOrderByCreatedAtDesc(user);

        notifications.forEach(notification ->
                notification.setRead(true)
        );

        notificationRepository.saveAll(notifications);
    }

    private NotificationDto toDto(
            Notification notification
    ) {

        Users actor = notification.getActor();

        return new NotificationDto(
                notification.getId(),
                notification.getType(),
                notification.getMessage(),
                notification.getReferenceId(),
                actor != null
                        ? actor.getId()
                        : null,
                actor != null &&
                        actor.getProfile() != null
                        ? actor.getProfile().getFullName()
                        : null,
                actor != null &&
                        actor.getProfile() != null
                        ? actor.getProfile().getUsername()
                        : null,
                actor != null &&
                        actor.getProfile() != null
                        ? actor.getProfile().getProfileImage()
                        : null,
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}
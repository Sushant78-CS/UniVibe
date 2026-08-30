package com.example.NotesRoom.controller;

import com.example.NotesRoom.dto.notification.NotificationDto;
import com.example.NotesRoom.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getNotifications(
            @AuthenticationPrincipal Jwt jwt
    ) {

        String clerkId = jwt.getSubject();

        return ResponseEntity.ok(
                notificationService.getNotifications(clerkId)
        );
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal Jwt jwt
    ) {

        String clerkId = jwt.getSubject();

        return ResponseEntity.ok(
                Map.of(
                        "count",
                        notificationService.getUnreadCount(clerkId)
                )
        );
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id
    ) {

        String clerkId = jwt.getSubject();

        notificationService.markAsRead(
                clerkId,
                id
        );

        return ResponseEntity.ok(
                Map.of(
                        "success", true
                )
        );
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(
            @AuthenticationPrincipal Jwt jwt
    ) {

        String clerkId = jwt.getSubject();

        notificationService.markAllAsRead(
                clerkId
        );

        return ResponseEntity.ok(
                Map.of(
                        "success", true
                )
        );
    }
}
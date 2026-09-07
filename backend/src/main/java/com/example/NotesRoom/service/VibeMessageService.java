package com.example.NotesRoom.service;

import com.example.NotesRoom.dto.vibe.VibeMessageRequest;
import com.example.NotesRoom.dto.vibe.VibeMessageResponse;
import com.example.NotesRoom.entity.Users;
import com.example.NotesRoom.entity.VibeMessage;
import com.example.NotesRoom.repository.UserRepository;
import com.example.NotesRoom.repository.VibeMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VibeMessageService {

    private final UserRepository userRepository;
    private final VibeMessageRepository vibeMessageRepository;
    private final NotificationService notificationService;
    private final VibePresenceService vibePresenceService;
    private final SimpMessagingTemplate messagingTemplate;

    // =========================================================
    // CREATE MESSAGE
    // =========================================================

    @Transactional
    public VibeMessageResponse createMessage(
            String clerkId,
            VibeMessageRequest request
    ) {

        Users sender =
                userRepository.findByClerkId(clerkId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );

        validateMessage(request);

        VibeMessage message =
                VibeMessage.builder()
                        .sender(sender)
                        .content(
                                normalize(
                                        request.content()
                                )
                        )
                        .mediaUrl(
                                normalize(
                                        request.mediaUrl()
                                )
                        )
                        .mediaType(
                                request.mediaType()
                        )
                        .createdAt(
                                Instant.now()
                        )
                        .build();

        VibeMessage saved =
                vibeMessageRepository.save(message);

        /*
         * IMPORTANT:
         *
         * WebSocket broadcasts to EVERYONE.
         *
         * Therefore we do NOT put "mine" in this
         * WebSocket response because "mine" is different
         * for every user.
         */
        VibeMessageResponse websocketResponse =
                toResponse(
                        saved,
                        false
                );

        messagingTemplate.convertAndSend(
                "/topic/vibe",
                websocketResponse
        );

        // -----------------------------------------------------
        // SEND NOTIFICATIONS
        // -----------------------------------------------------

        sendNotifications(
                sender,
                saved
        );

        /*
         * REST response is specifically for the sender,
         * therefore mine = true.
         */

        return toResponse(
                saved,
                true
        );
    }

    // =========================================================
    // GET LATEST MESSAGES
    // =========================================================

    @Transactional(readOnly = true)
    public List<VibeMessageResponse> getLatestMessages(
            String clerkId,
            int limit
    ) {

        Users currentUser =
                userRepository.findByClerkId(clerkId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );

        int safeLimit =
                Math.min(
                        Math.max(
                                limit,
                                1
                        ),
                        100
                );

        return vibeMessageRepository
                .findAllByOrderByCreatedAtDesc(
                        PageRequest.of(
                                0,
                                safeLimit
                        )
                )
                .stream()
                .map(
                        message ->
                                toResponse(
                                        message,
                                        message.getSender()
                                                .getId()
                                                .equals(
                                                        currentUser.getId()
                                                )
                                )
                )
                .toList();
    }

    // =========================================================
// EDIT MESSAGE
// =========================================================

    @Transactional
    public VibeMessageResponse editMessage(
            String clerkId,
            Long messageId,
            VibeMessageRequest request
    ) {

        Users currentUser =
                userRepository.findByClerkId(clerkId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );

        VibeMessage message =
                vibeMessageRepository.findById(messageId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Vibe message not found"
                                )
                        );

        // Only the creator can edit the message
        if (
                !message.getSender()
                        .getId()
                        .equals(currentUser.getId())
        ) {
            throw new RuntimeException(
                    "You can only edit your own messages"
            );
        }

        String content =
                normalize(
                        request.content()
                );

        // For now, editing means editing the text.
        // Existing media remains unchanged.
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException(
                    "Message content cannot be empty"
            );
        }

        if (content.length() > 5000) {
            throw new IllegalArgumentException(
                    "Message is too long"
            );
        }

        message.setContent(content);

        VibeMessage saved =
                vibeMessageRepository.save(message);

        /*
         * Broadcast the updated message.
         *
         * mine must NOT be included here because
         * WebSocket is received by everyone.
         */
        VibeMessageResponse websocketResponse =
                toResponse(
                        saved,
                        false
                );

        messagingTemplate.convertAndSend(
                "/topic/vibe",
                websocketResponse
        );

        // REST response is specifically for the editor
        return toResponse(
                saved,
                true
        );
    }


// =========================================================
// DELETE MESSAGE
// =========================================================

    @Transactional
    public void deleteMessage(
            String clerkId,
            Long messageId
    ) {

        Users currentUser =
                userRepository.findByClerkId(clerkId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );

        VibeMessage message =
                vibeMessageRepository.findById(messageId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Vibe message not found"
                                )
                        );

        // Only the creator can delete the message
        if (
                !message.getSender()
                        .getId()
                        .equals(currentUser.getId())
        ) {
            throw new RuntimeException(
                    "You can only delete your own messages"
            );
        }

        Long deletedMessageId =
                message.getId();

        vibeMessageRepository.delete(message);

        /*
         * Tell every connected Vibe user that this
         * message has been deleted.
         *
         * We don't send VibeMessageResponse here because
         * the message no longer exists.
         */
        messagingTemplate.convertAndSend(
                "/topic/vibe-delete",
                deletedMessageId
        );
    }

    // =========================================================
    // NOTIFICATIONS
    // =========================================================

    private void sendNotifications(
            Users sender,
            VibeMessage message
    ) {

        List<Users> users =
                userRepository.findAll();

        for (Users recipient : users) {

            // Never notify sender
            if (
                    recipient.getId()
                            .equals(sender.getId())
            ) {
                continue;
            }

            // User currently inside Vibe
            // receives it through WebSocket instead
            if (
                    vibePresenceService.isActive(
                            recipient.getId()
                    )
            ) {
                continue;
            }

            notificationService.createVibeNotification(
                    recipient,
                    "Someone shared something in Vibe.",
                    message.getId()
            );
        }
    }

    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateMessage(
            VibeMessageRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Message request is required"
            );
        }

        String content =
                normalize(
                        request.content()
                );

        String mediaUrl =
                normalize(
                        request.mediaUrl()
                );

        if (
                (content == null || content.isBlank())
                        &&
                        (mediaUrl == null || mediaUrl.isBlank())
        ) {
            throw new IllegalArgumentException(
                    "Message cannot be empty"
            );
        }

        if (
                content != null
                        &&
                        content.length() > 5000
        ) {
            throw new IllegalArgumentException(
                    "Message is too long"
            );
        }

        if (
                mediaUrl != null
                        &&
                        mediaUrl.length() > 2000
        ) {
            throw new IllegalArgumentException(
                    "Media URL is too long"
            );
        }

        if (
                mediaUrl != null
                        &&
                        request.mediaType() == null
        ) {
            throw new IllegalArgumentException(
                    "Media type is required"
            );
        }

        if (
                mediaUrl == null
                        &&
                        request.mediaType() != null
        ) {
            throw new IllegalArgumentException(
                    "Media URL is required"
            );
        }
    }

    // =========================================================
    // NORMALIZE
    // =========================================================

    private String normalize(
            String value
    ) {

        if (value == null) {
            return null;
        }

        String trimmed =
                value.trim();

        return trimmed.isEmpty()
                ? null
                : trimmed;
    }

    // =========================================================
    // RESPONSE
    // =========================================================

    private VibeMessageResponse toResponse(
            VibeMessage message,
            boolean mine
    ) {

        return new VibeMessageResponse(
                message.getId(),
                message.getContent(),
                message.getMediaUrl(),
                message.getMediaType(),
                message.getCreatedAt(),
                mine
        );
    }
}
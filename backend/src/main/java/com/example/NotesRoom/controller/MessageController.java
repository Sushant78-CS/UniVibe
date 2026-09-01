package com.example.NotesRoom.controller;

import com.example.NotesRoom.dto.message.ConversationDto;
import com.example.NotesRoom.dto.message.CreateMessageDto;
import com.example.NotesRoom.dto.message.MessageDto;
import com.example.NotesRoom.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    // ==========================================
    // CREATE / GET CONVERSATION
    // ==========================================

    @PostMapping("/conversations/{userId}")
    public ResponseEntity<ConversationDto> getOrCreateConversation(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long userId
    ) {

        String clerkId = jwt.getSubject();

        return ResponseEntity.ok(
                messageService.getOrCreateConversation(
                        clerkId,
                        userId
                )
        );
    }

    // ==========================================
    // CONVERSATION LIST
    // ==========================================

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDto>> getConversations(
            @AuthenticationPrincipal Jwt jwt
    ) {

        String clerkId = jwt.getSubject();

        return ResponseEntity.ok(
                messageService.getConversations(clerkId)
        );
    }

    // ==========================================
    // MESSAGES
    // ==========================================

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<List<MessageDto>> getMessages(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long conversationId
    ) {

        String clerkId = jwt.getSubject();

        return ResponseEntity.ok(
                messageService.getMessages(
                        clerkId,
                        conversationId
                )
        );
    }

    // ==========================================
    // SEND MESSAGE
    // ==========================================

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<MessageDto> sendMessage(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long conversationId,
            @RequestBody CreateMessageDto dto
    ) {

        String clerkId = jwt.getSubject();

        return ResponseEntity.ok(
                messageService.sendMessage(
                        clerkId,
                        conversationId,
                        dto
                )
        );
    }

    // ==========================================
// GET SINGLE CONVERSATION
// ==========================================

    @GetMapping("/conversations/{conversationId}/details")
    public ResponseEntity<ConversationDto> getConversation(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long conversationId
    ) {

        String clerkId = jwt.getSubject();

        return ResponseEntity.ok(
                messageService.getConversation(
                        clerkId,
                        conversationId
                )
        );
    }

    // ==========================================
    // MARK READ
    // ==========================================

    @PatchMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Void> markMessagesAsRead(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long conversationId
    ) {

        String clerkId = jwt.getSubject();

        messageService.markMessagesAsRead(
                clerkId,
                conversationId
        );

        return ResponseEntity.noContent().build();
    }
}
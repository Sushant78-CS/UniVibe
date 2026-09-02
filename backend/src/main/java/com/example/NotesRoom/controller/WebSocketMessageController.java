package com.example.NotesRoom.controller;

import com.example.NotesRoom.dto.message.CreateMessageDto;
import com.example.NotesRoom.dto.message.MessageDto;
import com.example.NotesRoom.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class WebSocketMessageController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/messages/{conversationId}")
    public void sendMessage(
            @DestinationVariable Long conversationId,
            CreateMessageDto dto,
            Principal principal
    ) {

        System.out.println(
                "WebSocket message received for conversation: "
                        + conversationId
        );

        System.out.println(
                "WebSocket principal: "
                        + principal
        );

        if (principal == null) {
            throw new IllegalStateException(
                    "WebSocket user is not authenticated"
            );
        }

        String clerkId = principal.getName();

        System.out.println(
                "Clerk ID: " + clerkId
        );

        MessageDto message =
                messageService.sendMessage(
                        clerkId,
                        conversationId,
                        dto
                );

        System.out.println(
                "Message saved successfully"
        );

        messagingTemplate.convertAndSend(
                "/topic/conversations/" + conversationId,
                message
        );

        System.out.println(
                "Message broadcast to conversation: "
                        + conversationId
        );
    }
}
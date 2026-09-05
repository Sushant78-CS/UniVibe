package com.example.NotesRoom.controller;

import com.example.NotesRoom.entity.Users;
import com.example.NotesRoom.repository.UserRepository;
import com.example.NotesRoom.service.VibePresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class VibeWebSocketController {

    private final UserRepository userRepository;
    private final VibePresenceService vibePresenceService;

    // =========================================================
    // ENTER VIBE
    // =========================================================

    @MessageMapping("/vibe/enter")
    public void enterVibe(
            StompHeaderAccessor accessor
    ) {

        Users user = getUser(accessor);

        String sessionId =
                accessor.getSessionId();

        vibePresenceService.enter(
                user.getId(),
                sessionId
        );
    }

    // =========================================================
    // LEAVE VIBE
    // =========================================================

    @MessageMapping("/vibe/leave")
    public void leaveVibe(
            StompHeaderAccessor accessor
    ) {

        Users user = getUser(accessor);

        String sessionId =
                accessor.getSessionId();

        vibePresenceService.leave(
                user.getId(),
                sessionId
        );
    }

    // =========================================================
    // GET AUTHENTICATED USER
    // =========================================================

    private Users getUser(
            StompHeaderAccessor accessor
    ) {

        Authentication authentication = null;

        // =====================================================
        // GET AUTHENTICATION FROM WEBSOCKET SESSION
        // =====================================================

        if (accessor.getSessionAttributes() != null) {

            Object storedAuthentication =
                    accessor.getSessionAttributes()
                            .get("WEBSOCKET_AUTH");

            if (storedAuthentication instanceof Authentication auth) {
                authentication = auth;
            }
        }

        // =====================================================
        // AUTHENTICATION REQUIRED
        // =====================================================

        if (authentication == null) {

            throw new IllegalArgumentException(
                    "WebSocket user is not authenticated"
            );
        }

        // =====================================================
        // JWT AUTHENTICATION
        // =====================================================

        if (
                authentication
                        instanceof JwtAuthenticationToken jwtAuthentication
        ) {

            Jwt jwt =
                    jwtAuthentication.getToken();

            String clerkId =
                    jwt.getSubject();

            return userRepository
                    .findByClerkId(clerkId)
                    .orElseThrow(
                            () -> new RuntimeException(
                                    "User not found"
                            )
                    );
        }

        // =====================================================
        // FALLBACK JWT PRINCIPAL
        // =====================================================

        Object principal =
                authentication.getPrincipal();

        if (principal instanceof Jwt jwt) {

            String clerkId =
                    jwt.getSubject();

            return userRepository
                    .findByClerkId(clerkId)
                    .orElseThrow(
                            () -> new RuntimeException(
                                    "User not found"
                            )
                    );
        }

        // =====================================================
        // INVALID AUTHENTICATION
        // =====================================================

        throw new IllegalArgumentException(
                "Invalid WebSocket authentication type: "
                        + authentication.getClass().getName()
        );
    }
}
package com.example.NotesRoom.service;

import com.example.NotesRoom.entity.Users;
import com.example.NotesRoom.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
public class VibeWebSocketEventListener {

    private final UserRepository userRepository;
    private final VibePresenceService vibePresenceService;

    @EventListener
    public void handleDisconnect(
            SessionDisconnectEvent event
    ) {

        StompHeaderAccessor accessor =
                StompHeaderAccessor.wrap(
                        event.getMessage()
                );

        // =====================================================
        // GET AUTHENTICATION FROM WEBSOCKET SESSION
        // =====================================================

        Authentication authentication = null;

        if (accessor.getSessionAttributes() != null) {

            Object storedAuthentication =
                    accessor.getSessionAttributes()
                            .get("WEBSOCKET_AUTH");

            if (storedAuthentication instanceof Authentication auth) {
                authentication = auth;
            }
        }

        // If authentication wasn't stored, there is
        // nothing we can do.
        if (authentication == null) {
            return;
        }

        // =====================================================
        // GET CLERK ID
        // =====================================================

        String clerkId = null;

        if (authentication instanceof JwtAuthenticationToken jwtAuthentication) {

            Jwt jwt =
                    jwtAuthentication.getToken();

            clerkId =
                    jwt.getSubject();
        }

        // =====================================================
        // FALLBACK FOR JWT PRINCIPAL
        // =====================================================

        if (clerkId == null) {

            Object principal =
                    authentication.getPrincipal();

            if (principal instanceof Jwt jwt) {

                clerkId =
                        jwt.getSubject();
            }
        }

        if (clerkId == null) {
            return;
        }

        // =====================================================
        // FIND USER
        // =====================================================

        Users user =
                userRepository
                        .findByClerkId(clerkId)
                        .orElse(null);

        if (user == null) {
            return;
        }

        // =====================================================
        // REMOVE USER FROM VIBE PRESENCE
        // =====================================================

        vibePresenceService.leave(
                user.getId(),
                accessor.getSessionId()
        );
    }
}
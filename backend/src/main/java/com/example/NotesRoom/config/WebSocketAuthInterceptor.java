package com.example.NotesRoom.config;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationProvider;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Component;
import org.springframework.messaging.support.ChannelInterceptor;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtDecoder jwtDecoder;

    @Override
    public Message<?> preSend(
            Message<?> message,
            MessageChannel channel
    ) {

        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(
                        message,
                        StompHeaderAccessor.class
                );

        if (accessor == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();

        /*
         * Authenticate the STOMP CONNECT frame.
         */
        if (StompCommand.CONNECT.equals(command)) {

            String authorization =
                    accessor.getFirstNativeHeader("Authorization");

            if (authorization == null ||
                    !authorization.startsWith("Bearer ")) {

                throw new IllegalArgumentException(
                        "Missing WebSocket Authorization token"
                );
            }

            String token =
                    authorization.substring(7);

            JwtAuthenticationProvider provider =
                    new JwtAuthenticationProvider(jwtDecoder);

            Authentication authentication =
                    provider.authenticate(
                            new BearerTokenAuthenticationToken(token)
                    );

            /*
             * Store authenticated user on the STOMP session.
             */
            accessor.setUser(authentication);

            /*
             * Also store it in session attributes as an
             * additional safety mechanism.
             */
            if (accessor.getSessionAttributes() != null) {
                accessor.getSessionAttributes()
                        .put("WEBSOCKET_AUTH", authentication);
            }

            System.out.println(
                    "WebSocket authenticated: "
                            + authentication.getName()
            );
        }

        /*
         * For subsequent messages such as SEND/SUBSCRIBE,
         * restore the authenticated user from the session.
         */
        else {

            if (accessor.getUser() == null &&
                    accessor.getSessionAttributes() != null) {

                Object authentication =
                        accessor.getSessionAttributes()
                                .get("WEBSOCKET_AUTH");

                if (authentication instanceof Authentication auth) {
                    accessor.setUser(auth);
                }
            }
        }

        return message;
    }
}
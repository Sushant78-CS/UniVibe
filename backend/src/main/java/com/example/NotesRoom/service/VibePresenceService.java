package com.example.NotesRoom.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class VibePresenceService {

    /*
     * userId -> active WebSocket session IDs
     */
    private final Map<Long, Set<String>> userSessions =
            new ConcurrentHashMap<>();

    public void enter(
            Long userId,
            String sessionId
    ) {

        if (userId == null || sessionId == null) {
            return;
        }

        userSessions
                .computeIfAbsent(
                        userId,
                        id -> ConcurrentHashMap.newKeySet()
                )
                .add(sessionId);
    }

    public void leave(
            Long userId,
            String sessionId
    ) {

        if (userId == null || sessionId == null) {
            return;
        }

        Set<String> sessions =
                userSessions.get(userId);

        if (sessions == null) {
            return;
        }

        sessions.remove(sessionId);

        if (sessions.isEmpty()) {
            userSessions.remove(userId);
        }
    }

    public boolean isActive(Long userId) {

        Set<String> sessions =
                userSessions.get(userId);

        return sessions != null
                && !sessions.isEmpty();
    }
}
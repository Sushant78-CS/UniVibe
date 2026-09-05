package com.example.NotesRoom.dto.vibe;

import java.time.Instant;

public record VibeMessageResponse(
        Long id,
        String content,
        String mediaUrl,
        VibeMediaType mediaType,
        Instant createdAt,
        boolean mine
) {
}
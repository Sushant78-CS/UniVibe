package com.example.NotesRoom.dto.vibe;

public record VibeMessageRequest(
        String content,
        String mediaUrl,
        VibeMediaType mediaType

) {
}
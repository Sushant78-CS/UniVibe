package com.example.NotesRoom.dto.post;

public record CreatePostDto(
        String description,
        PostCategory category,
        String mediaUrl,
        String mediaType
) {
}

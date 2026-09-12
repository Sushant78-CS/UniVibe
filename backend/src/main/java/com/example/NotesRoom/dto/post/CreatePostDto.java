package com.example.NotesRoom.dto.post;

import java.util.List;

public record CreatePostDto(
        String description,
        PostCategory category,
        List<PostMediaDto> media
) {
}
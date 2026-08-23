package com.example.NotesRoom.dto.club;

public record ClubDetailsDto(
        Long id,
        String name,
        String description,
        String category,
        String image,
        Long memberCount
) {
}

package com.example.NotesRoom.dto.club;

public record ClubDto(
        Long id,
        String name,
        String description,
        String category,
        String image,
        long memberCount
) {
}

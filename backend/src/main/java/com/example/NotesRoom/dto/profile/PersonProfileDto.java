package com.example.NotesRoom.dto.profile;

public record PersonProfileDto(
        Long id,
        Long userId,
        String fullName,
        String username,
        String bio,
        String profileImage,
        String college,
        String department,
        String year,
        String interests,
        Long connectionsCount
) {
}
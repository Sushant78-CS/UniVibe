package com.example.NotesRoom.dto.profile;

public record ProfileDto(
        Long id,
        String fullName,
        String username,
        String bio,
        String profileImage,
        String college,
        String department,
        String year,
        String interests,
        Boolean profileCompleted
) {
}
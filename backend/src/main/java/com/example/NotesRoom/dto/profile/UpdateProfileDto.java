package com.example.NotesRoom.dto.profile;

public record UpdateProfileDto(
        String fullName,
        String username,
        String bio,
        String college,
        String department,
        String year,
        String interests,
        String profileImage
) {
}
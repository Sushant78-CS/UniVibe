package com.example.NotesRoom.dto.profile;

public record DiscoverProfileDto(
        Long id,
        Long userId,
        String fullName,
        String username,
        String profileImage,
        String college,
        String department,
        String year,
        String interests,
        String bio,
        String connectionStatus
) {}
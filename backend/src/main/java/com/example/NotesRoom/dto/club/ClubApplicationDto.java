package com.example.NotesRoom.dto.club;


import java.time.LocalDateTime;

public record ClubApplicationDto(
        Long id,

        Long clubId,
        String clubName,

        Long userId,
        Long profileId,

        String fullName,
        String username,
        String profileImage,

        ClubApplicationStatus status,

        LocalDateTime appliedAt,
        LocalDateTime updatedAt
) {
}
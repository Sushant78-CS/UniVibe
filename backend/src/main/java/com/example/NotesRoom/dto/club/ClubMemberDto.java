package com.example.NotesRoom.dto.club;

public record ClubMemberDto(
        Long profileId,
        String fullName,
        String username,
        String profileImage,
        String department,
        String year,
        String role
) {
}

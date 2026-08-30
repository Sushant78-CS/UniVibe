package com.example.NotesRoom.dto.algo.search;

public record SearchProfile(
        Long profileId,
        String fullName,
        String username,
        String college,
        String department
) {
}
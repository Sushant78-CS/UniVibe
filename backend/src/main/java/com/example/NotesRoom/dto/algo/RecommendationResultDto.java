package com.example.NotesRoom.dto.algo;

public record RecommendationResultDto(
        Long profileId,
        Long userId,
        String fullName,
        String username,
        String bio,
        String profileImage,
        String college,
        String department,
        String year,
        String interests,
        Double score,
        String connectionStatus
        ) {
}
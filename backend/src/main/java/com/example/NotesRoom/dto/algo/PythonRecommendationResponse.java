package com.example.NotesRoom.dto.algo;

import java.util.List;

public record PythonRecommendationResponse(
        List<RecommendationResult> recommendations) {
}
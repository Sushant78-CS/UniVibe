package com.example.NotesRoom.dto.algo;

import java.util.List;

public record RecommendationRequest(
        RecommendationProfile user,
        List<RecommendationProfile> candidates) {
}

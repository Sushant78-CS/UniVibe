package com.example.NotesRoom.dto.algo;

import java.util.List;

public record RecommendationProfile(
        Long profileId,
        List<String> interests,
        String department,
        String year) {

}

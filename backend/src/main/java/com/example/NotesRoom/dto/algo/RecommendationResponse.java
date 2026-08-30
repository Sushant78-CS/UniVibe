package com.example.NotesRoom.dto.algo;

import java.util.List;

public record RecommendationResponse(
                List<RecommendationResultDto> recommendations) {
}

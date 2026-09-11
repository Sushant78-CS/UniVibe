package com.example.NotesRoom.dto.algo.search;

import com.example.NotesRoom.dto.algo.RecommendationResultDto;

import java.util.List;

public record SearchResponse(
        List<RecommendationResultDto> results,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean last
) {
}
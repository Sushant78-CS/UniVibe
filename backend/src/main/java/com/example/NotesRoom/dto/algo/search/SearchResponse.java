package com.example.NotesRoom.dto.algo.search;

import java.util.List;

public record SearchResponse(
        List<SearchProfile> results,
        String algorithm,
        String timeComplexity
) {
}
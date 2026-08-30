package com.example.NotesRoom.dto.algo.search;

import java.util.List;

public record SearchRequest(
        String query,
        List<SearchProfile> profiles
) {
}
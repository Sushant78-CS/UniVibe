package com.example.NotesRoom.controller;

import com.example.NotesRoom.dto.algo.search.SearchResponse;
import com.example.NotesRoom.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/discover")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/search")
    public ResponseEntity<SearchResponse> searchPeople(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        String clerkId = jwt.getSubject();

        SearchResponse response =
                searchService.searchPeople(
                        clerkId,
                        query,
                        page,
                        size
                );

        return ResponseEntity.ok(response);
    }
}
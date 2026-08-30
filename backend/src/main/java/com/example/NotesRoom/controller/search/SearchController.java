package com.example.NotesRoom.controller.search;

import com.example.NotesRoom.dto.algo.search.SearchResponse;
import com.example.NotesRoom.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<SearchResponse> search(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String query
    ) {

        String clerkId = jwt.getSubject();

        return ResponseEntity.ok(
                searchService.searchProfiles(
                        clerkId,
                        query
                )
        );
    }
}
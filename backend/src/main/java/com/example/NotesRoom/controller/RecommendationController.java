package com.example.NotesRoom.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.NotesRoom.dto.algo.RecommendationResponse;
import com.example.NotesRoom.service.RecommendationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping
    public ResponseEntity<RecommendationResponse> getRecommendations(
            @AuthenticationPrincipal Jwt jwt) {

        String clerkId = jwt.getSubject();

        return ResponseEntity.ok(
                recommendationService.getRecommendations(clerkId));
    }
}
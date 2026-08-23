package com.example.NotesRoom.controller;

import com.example.NotesRoom.dto.profile.DiscoverProfileDto;
import com.example.NotesRoom.entity.Profile;
import com.example.NotesRoom.service.DiscoverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/discover")
@RequiredArgsConstructor
public class DiscoverController {

    private final DiscoverService discoverService;

    @GetMapping("/people")
    public List<DiscoverProfileDto> discoverPeople(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String college,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String year
    ) {

        String clerkId = jwt.getSubject();

        return discoverService.discoverPeople(
                clerkId,
                query,
                college,
                department,
                year
        );
    }

    @GetMapping("/people/{id}")
    public ResponseEntity<?> getPerson(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id
    ) {
        try {
            String clerkId = jwt.getSubject();

            return ResponseEntity.ok(
                    discoverService.getPerson(id, clerkId)
            );

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of(
                            "success", false,
                            "error", e.getMessage()
                    )
            );
        }
    }
}
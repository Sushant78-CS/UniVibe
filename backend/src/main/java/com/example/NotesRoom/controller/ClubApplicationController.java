package com.example.NotesRoom.controller;

import com.example.NotesRoom.dto.club.ClubApplicationActionDto;
import com.example.NotesRoom.dto.club.ClubApplicationDto;
import com.example.NotesRoom.service.ClubApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/clubs")
@RequiredArgsConstructor
public class ClubApplicationController {
    private final ClubApplicationService clubApplicationService;

    /**
     * Student applies to join a club.
     */
    @PostMapping("/{clubId}/applications")
    public ResponseEntity<?> applyToClub(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long clubId) {
        try {
            String clerkId = jwt.getSubject();
            ClubApplicationDto application =
                    clubApplicationService.apply(clerkId, clubId);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(application);
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "success", false,
                            "error", e.getMessage()
                    ));
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "error", e.getMessage()
                    ));
        }
    }

    /**
     * Get current user's application for a club.
     */
    @GetMapping("/{clubId}/applications/me")
    public ResponseEntity<?> getMyApplication(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long clubId) {
        try {
            String clerkId = jwt.getSubject();
            ClubApplicationDto application =
                    clubApplicationService.getMyApplication(clerkId, clubId);
            return ResponseEntity.ok(application);
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "error", "Application not found"
                    ));
        }
    }

    /**
     * Student withdraws a pending application.
     */
    @DeleteMapping("/{clubId}/applications")
    public ResponseEntity<?> withdrawApplication(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long clubId) {
        try {
            String clerkId = jwt.getSubject();
            clubApplicationService.withdraw(clerkId, clubId);
            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "message",
                            "Application withdrawn"
                    ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "success", false,
                            "error", e.getMessage()
                    ));
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "error", "Application not found"));
        }
    }
}
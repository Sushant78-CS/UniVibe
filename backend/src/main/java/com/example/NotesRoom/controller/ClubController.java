package com.example.NotesRoom.controller;

import com.example.NotesRoom.dto.club.ClubDetailsDto;
import com.example.NotesRoom.dto.club.ClubDto;
import com.example.NotesRoom.dto.club.ClubMemberDto;
import com.example.NotesRoom.service.ClubService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/clubs")
@RequiredArgsConstructor
public class ClubController {
    private final ClubService clubService;

    @GetMapping
    public ResponseEntity<List<ClubDto>> getClubs() {
        return ResponseEntity.ok(
                clubService.getClubs()
        );
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<ClubMemberDto>> getMembers(@PathVariable Long id) {
        return ResponseEntity.ok(
                clubService.getMembers(id)
        );
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinClub(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id) {
        try {
            String clerkId = jwt.getSubject();
            clubService.joinClub(id, clerkId);
            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "message", "Joined club"
                    ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "error", e.getMessage()
                    ));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}/leave")
    public ResponseEntity<?> leaveClub(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id) {
        try {
            String clerkId = jwt.getSubject();
            clubService.leaveClub(id, clerkId);
            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "message", "Left club"
                    ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "error", e.getMessage()
                    ));
        }
    }

    @GetMapping("/{id}/membership")
    public ResponseEntity<?> membership(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id
    ) {
        String clerkId = jwt.getSubject();
        boolean member =
                clubService.isMember(id, clerkId);
        return ResponseEntity.ok(
                Map.of(
                        "member", member
                )
        );
    }

    @GetMapping("/my")
    public ResponseEntity<List<ClubDto>> getMyClubs(
            @AuthenticationPrincipal Jwt jwt) {
        String clerkId = jwt.getSubject();
        return ResponseEntity.ok(clubService.getMyClubs(clerkId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getClub(
            @PathVariable Long id) {
        try {
            ClubDetailsDto club = clubService.getClub(id);
            return ResponseEntity.ok(club);
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "error", "Club not found"
                    ));
        }
    }
}
package com.example.NotesRoom.controller;

import com.example.NotesRoom.dto.vibe.VibeMessageRequest;
import com.example.NotesRoom.dto.vibe.VibeMessageResponse;
import com.example.NotesRoom.service.VibeMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vibe")
@RequiredArgsConstructor
public class VibeMessageController {

    private final VibeMessageService vibeMessageService;

    // =========================================================
    // GET VIBE MESSAGES
    // =========================================================

    @GetMapping("/messages")
    public ResponseEntity<List<VibeMessageResponse>> getMessages(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "50") int limit
    ) {

        String clerkId = jwt.getSubject();

        return ResponseEntity.ok(
                vibeMessageService.getLatestMessages(
                        clerkId,
                        limit
                )
        );
    }

    // =========================================================
    // SEND VIBE MESSAGE
    // =========================================================

    @PostMapping("/messages")
    public ResponseEntity<VibeMessageResponse> sendMessage(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody VibeMessageRequest request
    ) {

        String clerkId = jwt.getSubject();

        return ResponseEntity.ok(
                vibeMessageService.createMessage(
                        clerkId,
                        request
                )
        );
    }
}
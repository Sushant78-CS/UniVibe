package com.example.NotesRoom.controller;

import com.example.NotesRoom.dto.vibe.VibeMessageRequest;
import com.example.NotesRoom.dto.vibe.VibeMessageResponse;
import com.example.NotesRoom.service.VibeMemberService;
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
    private final VibeMemberService vibeMemberService;

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

    @PutMapping("/messages/{messageId}")
    public ResponseEntity<VibeMessageResponse> editMessage(
            @PathVariable Long messageId,
            @RequestBody VibeMessageRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {

        String clerkId = jwt.getSubject();

        return ResponseEntity.ok(
                vibeMessageService.editMessage(
                        clerkId,
                        messageId,
                        request
                )
        );
    }

    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long messageId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        String clerkId = jwt.getSubject();

        vibeMessageService.deleteMessage(
                clerkId,
                messageId
        );

        return ResponseEntity.noContent().build();
    }

    // =========================================================
// VIBE MEMBERSHIP
// =========================================================

    @GetMapping("/membership")
    public ResponseEntity<Boolean> checkMembership(
            @AuthenticationPrincipal Jwt jwt
    ) {

        String clerkId = jwt.getSubject();

        return ResponseEntity.ok(
                vibeMemberService.isMember(clerkId)
        );
    }

    @PostMapping("/join")
    public ResponseEntity<Void> joinVibe(
            @AuthenticationPrincipal Jwt jwt
    ) {

        String clerkId = jwt.getSubject();

        vibeMemberService.join(clerkId);

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/leave")
    public ResponseEntity<Void> leaveVibe(
            @AuthenticationPrincipal Jwt jwt
    ) {

        String clerkId = jwt.getSubject();

        vibeMemberService.leave(clerkId);

        return ResponseEntity.noContent().build();
    }
}
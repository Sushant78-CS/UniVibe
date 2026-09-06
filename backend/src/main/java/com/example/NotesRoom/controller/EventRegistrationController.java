package com.example.NotesRoom.controller;

import com.example.NotesRoom.dto.event.EventRegistrationRequest;
import com.example.NotesRoom.dto.event.EventRegistrationResponse;
import com.example.NotesRoom.service.EventRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventRegistrationController {

    private final EventRegistrationService eventRegistrationService;

    @PostMapping("/{eventId}/register")
    public ResponseEntity<EventRegistrationResponse> register(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long eventId,
            @RequestBody EventRegistrationRequest request
    ) {

        String clerkId = jwt.getSubject();

        return ResponseEntity.ok(
                eventRegistrationService.register(
                        clerkId,
                        eventId,
                        request
                )
        );
    }
}
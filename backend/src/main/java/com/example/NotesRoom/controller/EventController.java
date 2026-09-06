package com.example.NotesRoom.controller;

import com.example.NotesRoom.dto.event.EventRegistrationResponseDto;
import com.example.NotesRoom.dto.event.EventRequest;
import com.example.NotesRoom.dto.event.EventResponse;
import com.example.NotesRoom.service.EventRegistrationService;
import com.example.NotesRoom.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final EventRegistrationService eventRegistrationService;

    @GetMapping
    public ResponseEntity<List<EventResponse>> getEvents(
            @AuthenticationPrincipal Jwt jwt
    ) {
        String clerkId = jwt.getSubject();
        return ResponseEntity.ok(
                eventService.getEvents(clerkId)
        );
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<EventResponse> getEvent(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long eventId
    ) {
        String clerkId = jwt.getSubject();
        return ResponseEntity.ok(
                eventService.getEvent(clerkId, eventId)
        );
    }

    @PostMapping
    public ResponseEntity<EventResponse> createEvent(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody EventRequest request
    ) {

        String clerkId = jwt.getSubject();

        return ResponseEntity.ok(
                eventService.createEvent(
                        clerkId,
                        request
                )
        );
    }

    @PutMapping("/{eventId}")
    public ResponseEntity<EventResponse> updateEvent(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long eventId,
            @RequestBody EventRequest request
    ) {

        String clerkId = jwt.getSubject();

        return ResponseEntity.ok(
                eventService.updateEvent(
                        clerkId,
                        eventId,
                        request
                )
        );
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> deleteEvent(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long eventId
    ) {

        String clerkId = jwt.getSubject();

        eventService.deleteEvent(
                clerkId,
                eventId
        );

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{eventId}/registrations")
    public ResponseEntity<List<EventRegistrationResponseDto>> getRegistrations(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long eventId
    ) {
        String clerkId = jwt.getSubject();

        return ResponseEntity.ok(
                eventRegistrationService.getEventRegistrations(
                        clerkId,
                        eventId
                )
        );
    }
}
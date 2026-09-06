package com.example.NotesRoom.controller;

import com.example.NotesRoom.dto.event.RegistrationFormRequest;
import com.example.NotesRoom.dto.event.RegistrationFormResponse;
import com.example.NotesRoom.service.RegistrationFormService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class RegistrationFormController {

    private final RegistrationFormService registrationFormService;

    @PostMapping("/{eventId}/registration-form")
    public ResponseEntity<RegistrationFormResponse> createForm(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long eventId,
            @RequestBody RegistrationFormRequest request
    ) {

        String clerkId = jwt.getSubject();

        return ResponseEntity.ok(
                registrationFormService.createForm(
                        clerkId,
                        eventId,
                        request
                )
        );
    }

    @GetMapping("/{eventId}/registration-form")
    public ResponseEntity<RegistrationFormResponse> getForm(
            @PathVariable Long eventId
    ) {

        return ResponseEntity.ok(
                registrationFormService.getForm(
                        eventId
                )
        );
    }

    @PutMapping("/{eventId}/registration-form")
    public ResponseEntity<RegistrationFormResponse> updateForm(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long eventId,
            @RequestBody RegistrationFormRequest request
    ) {

        String clerkId = jwt.getSubject();

        return ResponseEntity.ok(
                registrationFormService.updateForm(
                        clerkId,
                        eventId,
                        request
                )
        );
    }
}
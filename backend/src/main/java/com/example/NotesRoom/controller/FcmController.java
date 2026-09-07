package com.example.NotesRoom.controller;

import com.example.NotesRoom.dto.FcmRegistrationDto;
import com.example.NotesRoom.entity.Users;
import com.example.NotesRoom.repository.UserRepository;
import com.example.NotesRoom.service.FcmInstallationService;
import com.example.NotesRoom.service.FcmService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/fcm")
@RequiredArgsConstructor
public class FcmController {

    private final FcmInstallationService fcmInstallationService;
    private final FcmService fcmService;
    private final UserRepository userRepository;

    // =========================================================
    // REGISTER FCM TOKEN
    // =========================================================

    @PostMapping("/register")
    public ResponseEntity<Void> register(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody FcmRegistrationDto dto
    ) {

        fcmInstallationService.register(
                jwt.getSubject(),
                dto
        );

        return ResponseEntity.ok().build();
    }

    // =========================================================
    // UNREGISTER FCM TOKEN
    // =========================================================

    @DeleteMapping("/unregister")
    public ResponseEntity<Void> unregister(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody FcmRegistrationDto dto
    ) {

        if (dto == null ||
                dto.token() == null ||
                dto.token().isBlank()) {

            return ResponseEntity.badRequest().build();
        }

        fcmInstallationService.unregister(
                jwt.getSubject(),
                dto.token()
        );

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // TEST FCM
    // =========================================================

    @PostMapping("/test")
    public ResponseEntity<Void> test(
            @AuthenticationPrincipal Jwt jwt
    ) {

        Users user = userRepository
                .findByClerkId(jwt.getSubject())
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        fcmService.sendToUser(
                user,
                "UniVibe test",
                "Push notifications are working!",
                "/home"
        );

        return ResponseEntity.ok().build();
    }

    @GetMapping("/status")
    public ResponseEntity<Boolean> status(
            @AuthenticationPrincipal Jwt jwt
    ) {

        boolean registered =
                fcmInstallationService.isRegistered(
                        jwt.getSubject()
                );

        return ResponseEntity.ok(registered);
    }
}
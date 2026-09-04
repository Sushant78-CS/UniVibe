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

    @DeleteMapping("/register")
    public ResponseEntity<Void> unregister(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String fid
    ) {
        fcmInstallationService.unregister(
                jwt.getSubject(),
                fid
        );

        return ResponseEntity.noContent().build();
    }

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
}
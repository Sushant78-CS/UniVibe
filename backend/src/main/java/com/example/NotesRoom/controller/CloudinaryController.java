package com.example.NotesRoom.controller;

import com.example.NotesRoom.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/cloudinary")
@RequiredArgsConstructor
public class CloudinaryController {

    private final CloudinaryService cloudinaryService;

    @GetMapping("/signature")
    public Map<String, String> getUploadSignature(
            @AuthenticationPrincipal Jwt jwt
    ) {

        // Make sure the request is authenticated
        if (jwt == null) {
            throw new RuntimeException("Unauthorized");
        }

        return cloudinaryService
                .generatePostImageUploadSignature();
    }

    @GetMapping("/video-signature")
    public Map<String, String> getVideoUploadSignature(
            @AuthenticationPrincipal Jwt jwt
    ) {

        if (jwt == null) {
            throw new RuntimeException("Unauthorized");
        }

        return cloudinaryService
                .generatePostVideoUploadSignature();
    }
}
package com.example.NotesRoom.service;

import com.example.NotesRoom.dto.FcmRegistrationDto;
import com.example.NotesRoom.entity.FcmInstallation;
import com.example.NotesRoom.entity.Users;
import com.example.NotesRoom.repository.FcmInstallationRepository;
import com.example.NotesRoom.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class FcmInstallationService {

    private final UserRepository userRepository;
    private final FcmInstallationRepository fcmInstallationRepository;

    @Transactional
    public void register(
            String clerkId,
            FcmRegistrationDto dto
    ) {

        if (dto == null ||
                dto.token() == null ||
                dto.token().isBlank()) {

            throw new IllegalArgumentException(
                    "FCM token is required"
            );
        }

        Users user = userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        String token = dto.token().trim();
        Instant now = Instant.now();

        FcmInstallation installation =
                fcmInstallationRepository
                        .findByToken(token)
                        .orElse(null);

        if (installation == null) {

            installation =
                    FcmInstallation.builder()
                            .user(user)
                            .token(token)
                            .createdAt(now)
                            .updatedAt(now)
                            .build();

        } else {

            installation.setUser(user);
            installation.setUpdatedAt(now);
        }

        fcmInstallationRepository.save(installation);
    }

    @Transactional
    public void unregister(
            String clerkId,
            String token
    ) {

        userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        if (token == null || token.isBlank()) {

            throw new IllegalArgumentException(
                    "FCM token is required"
            );
        }

        fcmInstallationRepository.deleteByToken(
                token.trim()
        );
    }

    @Transactional(readOnly = true)
    public boolean isRegistered(String clerkId) {

        Users user = userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        return !fcmInstallationRepository
                .findAllByUser(user)
                .isEmpty();
    }
}
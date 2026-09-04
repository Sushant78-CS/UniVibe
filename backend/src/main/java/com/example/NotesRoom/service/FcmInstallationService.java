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
import java.time.LocalDateTime;

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
        if (dto == null || dto.fid() == null || dto.fid().isBlank()) {
            throw new IllegalArgumentException(
                    "FCM installation ID is required"
            );
        }

        Users user = userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        String fid = dto.fid().trim();
        Instant now = Instant.now();

        FcmInstallation installation =
                fcmInstallationRepository
                        .findByFid(fid)
                        .orElse(null);

        if (installation == null) {
            installation = FcmInstallation.builder()
                    .user(user)
                    .fid(fid)
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
            String fid
    ) {
        userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (fid == null || fid.isBlank()) {
            throw new IllegalArgumentException("FCM installation ID is required");
        }

        fcmInstallationRepository.deleteByFid(fid.trim());
    }
}
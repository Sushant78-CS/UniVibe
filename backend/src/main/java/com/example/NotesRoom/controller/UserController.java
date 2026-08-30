package com.example.NotesRoom.controller;

import com.example.NotesRoom.dto.connection.ConnectedPersonDto;
import com.example.NotesRoom.dto.connection.ConnectionActionDto;
import com.example.NotesRoom.dto.connection.CreateConnectionDto;
import com.example.NotesRoom.dto.profile.CreateProfileDto;
import com.example.NotesRoom.dto.profile.ProfileDto;
import com.example.NotesRoom.dto.profile.UpdateProfileDto;
import com.example.NotesRoom.entity.Connection;
import com.example.NotesRoom.entity.Profile;
import com.example.NotesRoom.service.ConnectionService;
import com.example.NotesRoom.service.ProfileService;
import com.example.NotesRoom.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final ProfileService profileService;
    private final ConnectionService connectionService;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(
            @AuthenticationPrincipal Jwt jwt
    ) {

        String clerkId = jwt.getSubject();

        ProfileDto profile = profileService.getProfile(clerkId);

        return ResponseEntity.ok(profile);
    }

    @PostMapping("/profile")
    public ResponseEntity<?> createProfile(
            @AuthenticationPrincipal Jwt jwt,
            @ModelAttribute CreateProfileDto dto,
            @RequestParam(
                    value = "profileImage",
                    required = false
            )
            MultipartFile profileImage) {
        try {
            String clerkId = jwt.getSubject();
            Profile profile = profileService.createProfile(
                    clerkId,
                    dto,
                    profileImage
            );
            return ResponseEntity.ok(profile);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "error", "Profile image upload failed"
            ));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileDto> updateProfile(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody UpdateProfileDto dto
    ) {
        String clerkId = jwt.getSubject();

        return ResponseEntity.ok(
                profileService.updateProfile(clerkId, dto)
        );
    }

    @DeleteMapping("/image")
    public ResponseEntity<ProfileDto> deleteProfileImage(@AuthenticationPrincipal Jwt jwt
    ) throws IOException {
        String clerkId = jwt.getSubject();
        return ResponseEntity.ok(
                profileService.deleteProfileImage(clerkId)
        );
    }

    @PostMapping("/connections")
    public ResponseEntity<?> sendConnection(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody CreateConnectionDto dto
    ) {
        try {
            String clerkId = jwt.getSubject();

            Connection connection =
                    connectionService.sendRequest(clerkId, dto);

            return ResponseEntity.ok(connection);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "error", e.getMessage()
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "error", "Unable to send connection request"
                    )
            );
        }
    }

    @GetMapping("/connections/requests")
    public ResponseEntity<?> getConnectionRequests(
            @AuthenticationPrincipal Jwt jwt
    ) {
        String clerkId = jwt.getSubject();

        return ResponseEntity.ok(
                connectionService.getRequests(clerkId)
        );
    }

    @PutMapping("/connections/{id}")
    public ResponseEntity<?> updateConnection(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @RequestBody ConnectionActionDto dto) {
        try {
            String clerkId = jwt.getSubject();
            connectionService.updateRequest(
                    clerkId,
                    id,
                    dto.action()
            );
            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "message", "Connection updated"
                    ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(
                    HttpStatus.NOT_FOUND).body(
                    Map.of(
                            "success", false,
                            "error", "Connection request not found"));
        }
    }

    @GetMapping("/connections")
    public ResponseEntity<?> getConnections(
            @AuthenticationPrincipal Jwt jwt) {
        try {
            String clerkId = jwt.getSubject();
            List<ConnectedPersonDto> connections =
                    connectionService.getConnections(clerkId);
            return ResponseEntity.ok(connections);
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "error", "Failed to load connections"
                    ));
        }
    }
}
package com.example.NotesRoom.service;

import com.example.NotesRoom.dto.connection.ConnectionStatus;
import com.example.NotesRoom.dto.profile.DiscoverProfileDto;
import com.example.NotesRoom.dto.profile.PersonProfileDto;
import com.example.NotesRoom.entity.Connection;
import com.example.NotesRoom.entity.Profile;
import com.example.NotesRoom.entity.Users;
import com.example.NotesRoom.repository.ConnectionRepository;
import com.example.NotesRoom.repository.ProfileRepository;
import com.example.NotesRoom.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DiscoverService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final ConnectionRepository connectionRepository;

    /* =========================================================
       DISCOVER PEOPLE
       ========================================================= */

    public List<DiscoverProfileDto> discoverPeople(
            String clerkId,
            String query,
            String college,
            String department,
            String year
    ) {

        Users currentUser = userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<Profile> profiles = profileRepository.discoverPeople(
                clerkId,
                clean(query),
                clean(college),
                clean(department),
                clean(year)
        );

        return profiles.stream()
                .map(profile ->
                        toDiscoverDto(
                                profile,
                                currentUser.getId()
                        )
                )
                .toList();
    }

    /* =========================================================
       DISCOVER DTO
       ========================================================= */

    private DiscoverProfileDto toDiscoverDto(
            Profile profile,
            Long currentUserId
    ) {

        String connectionStatus =
                getConnectionStatus(
                        currentUserId,
                        profile.getUser().getId()
                );

        return new DiscoverProfileDto(
                profile.getId(),
                profile.getUser().getId(),
                profile.getFullName(),
                profile.getUsername(),
                profile.getProfileImage(),
                profile.getCollege(),
                profile.getDepartment(),
                profile.getYear(),
                profile.getInterests(),
                profile.getBio(),
                connectionStatus
        );
    }

    /* =========================================================
       CONNECTION STATUS
       ========================================================= */

    private String getConnectionStatus(
            Long currentUserId,
            Long otherUserId
    ) {

        return connectionRepository
                .findConnectionBetweenUsers(
                        currentUserId,
                        otherUserId
                )
                .map(connection -> {

                    if (connection.getStatus()
                            == ConnectionStatus.ACCEPTED) {

                        return "CONNECTED";
                    }

                    if (connection.getStatus()
                            == ConnectionStatus.PENDING) {

                        if (connection.getSender()
                                .getId()
                                .equals(currentUserId)) {

                            return "PENDING_SENT";
                        }

                        return "PENDING_RECEIVED";
                    }

                    return "NONE";
                })
                .orElse("NONE");
    }

    /* =========================================================
       PERSON PROFILE
       ========================================================= */

    public PersonProfileDto getPerson(
            Long id,
            String clerkId
    ) {

        Profile profile = profileRepository
                .findByIdAndProfileCompletedTrue(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Profile not found"
                        )
                );

        /* -----------------------------------------------------
           Prevent viewing own profile through this endpoint.
           Keep this if your controller has a separate
           /profile endpoint for the user's own profile.
           ----------------------------------------------------- */

        if (profile.getUser()
                .getClerkId()
                .equals(clerkId)) {

            throw new RuntimeException(
                    "Cannot view your own profile"
            );
        }

        /* -----------------------------------------------------
           COUNT ACCEPTED CONNECTIONS
           ----------------------------------------------------- */

        long connectionsCount =
                connectionRepository
                        .countConnectionsByStatus(
                                profile.getUser().getId(),
                                ConnectionStatus.ACCEPTED
                        );

        /* -----------------------------------------------------
           RETURN PERSON PROFILE
           ----------------------------------------------------- */

        return new PersonProfileDto(
                profile.getId(),
                profile.getUser().getId(),
                profile.getFullName(),
                profile.getUsername(),
                profile.getBio(),
                profile.getProfileImage(),
                profile.getCollege(),
                profile.getDepartment(),
                profile.getYear(),
                profile.getInterests(),
                connectionsCount
        );
    }

    /* =========================================================
       CLEAN INPUT
       ========================================================= */

    private String clean(String value) {
        return value == null
                ? ""
                : value.trim();
    }
}
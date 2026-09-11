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
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional(readOnly = true)
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

        List<Profile> profiles =
                profileRepository.discoverPeople(
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

    @Transactional(readOnly = true)
    public PersonProfileDto getPerson(
            Long id,
            String clerkId
    ) {

        Profile profile =
                profileRepository
                        .findByIdAndProfileCompletedTrue(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Profile not found"
                                )
                        );

        /*
         * Profile.user is LAZY, so this method
         * runs inside a read-only transaction.
         */
        Users profileUser = profile.getUser();

        /*
         * Prevent viewing your own profile
         * through the public profile endpoint.
         */
        if (profileUser.getClerkId().equals(clerkId)) {

            throw new RuntimeException(
                    "Cannot view your own profile"
            );
        }

        /*
         * Get the currently logged-in user.
         */
        Users currentUser =
                userRepository
                        .findByClerkId(clerkId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        /*
         * Find the connection between the
         * current user and this profile.
         */
        var connection =
                connectionRepository.findConnectionBetweenUsers(
                        currentUser.getId(),
                        profileUser.getId()
                );

        /*
         * Default state.
         */
        String connectionStatus = "NONE";
        Long connectionId = null;

        /*
         * Determine the actual relationship.
         */
        if (connection.isPresent()) {

            Connection existingConnection =
                    connection.get();

            connectionId =
                    existingConnection.getId();

            if (existingConnection.getStatus()
                    == ConnectionStatus.ACCEPTED) {

                connectionStatus = "CONNECTED";

            } else if (existingConnection.getStatus()
                    == ConnectionStatus.PENDING) {

                if (existingConnection.getSender()
                        .getId()
                        .equals(currentUser.getId())) {

                    connectionStatus = "PENDING_SENT";

                } else {

                    connectionStatus = "PENDING_RECEIVED";
                }
            }
        }

        /*
         * Count accepted connections.
         */
        long connectionsCount =
                connectionRepository
                        .countConnectionsByStatus(
                                profileUser.getId(),
                                ConnectionStatus.ACCEPTED
                        );

        /*
         * Return complete public profile.
         */
        return new PersonProfileDto(
                profile.getId(),
                profileUser.getId(),
                profile.getFullName(),
                profile.getUsername(),
                profile.getBio(),
                profile.getProfileImage(),
                profile.getCollege(),
                profile.getDepartment(),
                profile.getYear(),
                profile.getInterests(),
                connectionsCount,
                connectionStatus,
                connectionId
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
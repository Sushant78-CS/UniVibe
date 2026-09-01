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

    public List<DiscoverProfileDto> discoverPeople(
            String clerkId,
            String query,
            String college,
            String department,
            String year
    ) {

        Users currentUser = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Profile> profiles = profileRepository.discoverPeople(
                clerkId,
                clean(query),
                clean(college),
                clean(department),
                clean(year)
        );

        return profiles.stream()
                .map(profile -> toDto(profile, currentUser.getId()))
                .toList();
    }

    private DiscoverProfileDto toDto(
            Profile profile,
            Long currentUserId
    ) {

        String connectionStatus = connectionRepository
                .findConnectionBetweenUsers(
                        currentUserId,
                        profile.getUser().getId()
                )
                .map(connection -> {

                    if (connection.getStatus() == ConnectionStatus.ACCEPTED) {
                        return "ACCEPTED";
                    }

                    if (connection.getStatus() == ConnectionStatus.PENDING) {

                        if (connection.getSender().getId()
                                .equals(currentUserId)) {
                            return "PENDING_SENT";
                        }

                        return "PENDING_RECEIVED";
                    }

                    return "NONE";
                })
                .orElse("NONE");

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

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }

    private DiscoverProfileDto toDto(
            Profile profile,
            Users currentUser
    ) {

        String connectionStatus =
                getConnectionStatus(
                        currentUser,
                        profile.getUser()
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

    private String getConnectionStatus(
            Users currentUser,
            Users otherUser
    ) {

        return connectionRepository
                .findConnectionBetweenUsers(
                        currentUser.getId(),
                        otherUser.getId()
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
                                .equals(currentUser.getId())) {

                            return "PENDING_SENT";
                        }

                        return "PENDING_RECEIVED";
                    }

                    return "NONE";
                })
                .orElse("NONE");
    }

    public PersonProfileDto getPerson(
            Long id,
            String clerkId
    ) {

        Profile profile = profileRepository
                .findByIdAndProfileCompletedTrue(id)
                .orElseThrow(() ->
                        new RuntimeException("Profile not found")
                );

        if (profile.getUser()
                .getClerkId()
                .equals(clerkId)) {

            throw new RuntimeException(
                    "Cannot view your own profile"
            );
        }

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
                profile.getInterests()
        );
    }
}
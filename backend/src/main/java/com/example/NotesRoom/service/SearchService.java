package com.example.NotesRoom.service;

import com.example.NotesRoom.dto.algo.RecommendationResultDto;
import com.example.NotesRoom.dto.algo.search.SearchResponse;
import com.example.NotesRoom.dto.connection.ConnectionStatus;
import com.example.NotesRoom.entity.Profile;
import com.example.NotesRoom.entity.Users;
import com.example.NotesRoom.repository.ConnectionRepository;
import com.example.NotesRoom.repository.ProfileRepository;
import com.example.NotesRoom.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final ConnectionRepository connectionRepository;

    public SearchResponse searchPeople(
            String clerkId,
            String query,
            int page,
            int size
    ) {

        // Safety checks
        if (page < 0) {
            page = 0;
        }

        if (size <= 0) {
            size = 10;
        }

        // Never allow a large search request
        size = Math.min(size, 10);

        if (query == null) {
            query = "";
        }

        query = query.trim();

        // Don't search for empty or 1-character queries
        if (query.length() < 2) {

            Pageable emptyPage = PageRequest.of(page, size);

            return new SearchResponse(
                    java.util.List.of(),
                    page,
                    size,
                    0,
                    0,
                    true
            );
        }

        Users currentUser =
                userRepository.findByClerkId(clerkId)
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Direction.ASC,
                        "fullName"
                )
        );

        Page<Profile> profiles =
                profileRepository.searchPeople(
                        clerkId,
                        query,
                        pageable
                );

        var results = profiles.map(profile -> {

            Long otherUserId = profile.getUser().getId();

            String connectionStatus =
                    getConnectionStatus(
                            currentUser.getId(),
                            otherUserId
                    );

            return new RecommendationResultDto(
                    profile.getId(),
                    otherUserId,
                    profile.getFullName(),
                    profile.getUsername(),
                    profile.getBio(),
                    profile.getProfileImage(),
                    profile.getCollege(),
                    profile.getDepartment(),
                    profile.getYear(),
                    profile.getInterests(),
                    null,
                    connectionStatus
            );

        }).getContent();

        return new SearchResponse(
                results,
                profiles.getNumber(),
                profiles.getSize(),
                profiles.getTotalElements(),
                profiles.getTotalPages(),
                profiles.isLast()
        );
    }

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

                    if (connection.getSender()
                            .getId()
                            .equals(currentUserId)) {

                        return "PENDING_SENT";
                    }

                    if (connection.getReceiver()
                            .getId()
                            .equals(currentUserId)) {

                        return "PENDING_RECEIVED";
                    }

                    return "NONE";
                })
                .orElse("NONE");
    }
}
package com.example.NotesRoom.service;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.example.NotesRoom.dto.algo.RecommendationResponse;
import com.example.NotesRoom.dto.algo.RecommendationResultDto;
import com.example.NotesRoom.dto.connection.ConnectionStatus;
import com.example.NotesRoom.entity.Profile;
import com.example.NotesRoom.repository.ConnectionRepository;
import com.example.NotesRoom.repository.ProfileRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final ProfileRepository profileRepository;
    private final ConnectionRepository connectionRepository;

    public RecommendationResponse getRecommendations(
            String clerkId,
            int page,
            int size) {

        // Prevent invalid page
        if (page < 0) {
            page = 0;
        }

        // Default page size
        if (size <= 0) {
            size = 10;
        }

        // Maximum page size
        size = Math.min(size, 50);

        // Check current user's profile
        Profile userProfile =
                profileRepository
                        .findByUser_ClerkId(clerkId)
                        .orElseThrow(() ->
                                new RuntimeException("Profile not found")
                        );

        /*
         * IMPORTANT:
         *
         * Only 'size' users are loaded from the database.
         *
         * Example:
         * page = 0, size = 10
         * -> users 1-10
         *
         * page = 1, size = 10
         * -> users 11-20
         *
         * page = 2, size = 10
         * -> users 21-30
         */
        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(
                                Sort.Direction.ASC,
                                "fullName"
                        )
                );

        Page<Profile> candidatePage =
                profileRepository
                        .findByProfileCompletedTrueAndUser_ClerkIdNot(
                                clerkId,
                                pageable
                        );

        /*
         * Only the profiles in the current page are
         * converted and scored.
         *
         * If size = 10, this contains only 10 users.
         */
        List<RecommendationResultDto> recommendations =
                candidatePage
                        .getContent()
                        .stream()
                        .map(candidate ->
                                createRecommendation(
                                        userProfile,
                                        candidate
                                )
                        )
                        .sorted(
                                (a, b) ->
                                        Double.compare(
                                                b.score(),
                                                a.score()
                                        )
                        )
                        .toList();

        return new RecommendationResponse(
                recommendations,
                candidatePage.getNumber(),
                candidatePage.getSize(),
                candidatePage.getTotalElements(),
                candidatePage.getTotalPages(),
                candidatePage.isLast()
        );
    }

    private RecommendationResultDto createRecommendation(
            Profile currentProfile,
            Profile candidate) {

        double score =
                calculateScore(
                        currentProfile,
                        candidate
                );

        Long currentUserId =
                currentProfile
                        .getUser()
                        .getId();

        Long otherUserId =
                candidate
                        .getUser()
                        .getId();

        String connectionStatus =
                getConnectionStatus(
                        currentUserId,
                        otherUserId
                );

        return new RecommendationResultDto(
                candidate.getId(),
                candidate.getUser().getId(),
                candidate.getFullName(),
                candidate.getUsername(),
                candidate.getBio(),
                candidate.getProfileImage(),
                candidate.getCollege(),
                candidate.getDepartment(),
                candidate.getYear(),
                candidate.getInterests(),
                score,
                connectionStatus
        );
    }

    private double calculateScore(
            Profile currentProfile,
            Profile candidate) {

        double score = 0;

        // Same college
        if (sameValue(
                currentProfile.getCollege(),
                candidate.getCollege()
        )) {
            score += 30;
        }

        // Same department
        if (sameValue(
                currentProfile.getDepartment(),
                candidate.getDepartment()
        )) {
            score += 25;
        }

        // Same year
        if (sameValue(
                currentProfile.getYear(),
                candidate.getYear()
        )) {
            score += 15;
        }

        // Common interests
        Set<String> currentInterests =
                parseInterests(
                        currentProfile.getInterests()
                );

        Set<String> candidateInterests =
                parseInterests(
                        candidate.getInterests()
                );

        Set<String> commonInterests =
                new HashSet<>(currentInterests);

        commonInterests.retainAll(
                candidateInterests
        );

        score += Math.min(
                commonInterests.size() * 10,
                30
        );

        return Math.min(score, 100);
    }

    private boolean sameValue(
            String first,
            String second) {

        if (first == null
                || second == null
                || first.isBlank()
                || second.isBlank()) {

            return false;
        }

        return first
                .trim()
                .equalsIgnoreCase(
                        second.trim()
                );
    }

    private Set<String> parseInterests(
            String interests) {

        if (interests == null
                || interests.isBlank()) {

            return Collections.emptySet();
        }

        return Arrays.stream(
                        interests.split(",")
                )
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s -> !s.isBlank())
                .collect(Collectors.toSet());
    }

    private String getConnectionStatus(
            Long currentUserId,
            Long otherUserId) {

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
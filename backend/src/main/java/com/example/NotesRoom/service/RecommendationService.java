package com.example.NotesRoom.service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.example.NotesRoom.dto.algo.PythonRecommendationResponse;
import com.example.NotesRoom.dto.algo.RecommendationProfile;
import com.example.NotesRoom.dto.algo.RecommendationRequest;
import com.example.NotesRoom.dto.algo.RecommendationResponse;
import com.example.NotesRoom.dto.algo.RecommendationResultDto;
import com.example.NotesRoom.dto.connection.ConnectionStatus;
import com.example.NotesRoom.entity.Profile;
import com.example.NotesRoom.repository.ConnectionRepository;
import com.example.NotesRoom.repository.ProfileRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final ProfileRepository profileRepository;
    private final ConnectionRepository connectionRepository;

    @Value("${python.api.url}")
    private String pythonApiUrl;

    public RecommendationResponse getRecommendations(
            String clerkId
    ) {

        // 1. Get current user's profile
        Profile userProfile = profileRepository
                .findByUser_ClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("Profile not found")
                );

        // 2. Get all other completed profiles
        List<Profile> candidates = profileRepository
                .findByProfileCompletedTrueAndUser_ClerkIdNot(
                        clerkId
                );

        // 3. Convert current user to Python DTO
        RecommendationProfile user =
                toRecommendationProfile(userProfile);

        // 4. Convert candidates to Python DTOs
        List<RecommendationProfile> candidateProfiles =
                candidates.stream()
                        .map(this::toRecommendationProfile)
                        .toList();

        // 5. Create request for Python
        RecommendationRequest request =
                new RecommendationRequest(
                        user,
                        candidateProfiles
                );

        // 6. Call Python recommendation API
        RestClient restClient = RestClient.builder()
                .baseUrl(pythonApiUrl)
                .build();

        PythonRecommendationResponse pythonResponse =
                restClient
                        .post()
                        .uri("/recommend")
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)
                        .body(request)
                        .retrieve()
                        .body(PythonRecommendationResponse.class);

        if (pythonResponse == null) {
            throw new RuntimeException(
                    "Python recommendation service returned no response"
            );
        }

        // 7. Create profile lookup map
        Map<Long, Profile> profileMap =
                candidates.stream()
                        .collect(
                                Collectors.toMap(
                                        Profile::getId,
                                        Function.identity()
                                )
                        );

        Long currentUserId =
                userProfile.getUser().getId();

        // 8. Enrich Python results
        List<RecommendationResultDto> results =
                pythonResponse
                        .recommendations()
                        .stream()
                        .map(result -> {

                            Profile profile =
                                    profileMap.get(
                                            result.profileId()
                                    );

                            if (profile == null) {
                                return null;
                            }

                            String connectionStatus =
                                    getConnectionStatus(
                                            currentUserId,
                                            profile.getUser().getId()
                                    );

                            return new RecommendationResultDto(
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
                                    result.score(),
                                    connectionStatus
                            );
                        })
                        .filter(result -> result != null)
                        .toList();

        // 9. Return enriched recommendations
        return new RecommendationResponse(results);
    }

    private RecommendationProfile toRecommendationProfile(
            Profile profile
    ) {

        List<String> interests =
                parseInterests(
                        profile.getInterests()
                );

        return new RecommendationProfile(
                profile.getId(),
                interests,
                profile.getDepartment(),
                profile.getYear()
        );
    }

    private List<String> parseInterests(
            String interests
    ) {

        if (interests == null || interests.isBlank()) {
            return Collections.emptyList();
        }

        return Arrays.stream(
                        interests.split(",")
                )
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
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
package com.example.NotesRoom.service;

import com.example.NotesRoom.dto.algo.search.SearchProfile;
import com.example.NotesRoom.dto.algo.search.SearchRequest;
import com.example.NotesRoom.dto.algo.search.SearchResponse;
import com.example.NotesRoom.entity.Profile;
import com.example.NotesRoom.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final ProfileRepository profileRepository;

    @Value("${python.api.url}")
    private String pythonApiUrl;

    public SearchResponse searchProfiles(
            String clerkId,
            String query
    ) {

        List<Profile> profiles =
                profileRepository
                        .findByProfileCompletedTrueAndUser_ClerkIdNot(
                                clerkId
                        );

        List<SearchProfile> searchProfiles =
                profiles.stream()
                        .map(profile -> new SearchProfile(
                                profile.getId(),
                                profile.getFullName(),
                                profile.getUsername(),
                                profile.getCollege(),
                                profile.getDepartment()
                        ))
                        .toList();

        SearchRequest request =
                new SearchRequest(
                        query,
                        searchProfiles
                );

        RestClient restClient =
                RestClient.builder()
                        .baseUrl(pythonApiUrl)
                        .build();

        SearchResponse response =
                restClient
                        .post()
                        .uri("/search")
                        .body(request)
                        .retrieve()
                        .body(SearchResponse.class);

        if (response == null) {
            throw new RuntimeException(
                    "Python search service returned no response"
            );
        }

        return response;
    }
}
package com.example.NotesRoom.service;

import com.example.NotesRoom.dto.profile.CreateProfileDto;
import com.example.NotesRoom.dto.profile.ProfileDto;
import com.example.NotesRoom.entity.Profile;
import com.example.NotesRoom.entity.Users;
import com.example.NotesRoom.repository.ProfileRepository;
import com.example.NotesRoom.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    public ProfileDto getProfile(String clerkId) {

        Profile profile = profileRepository
                .findByUser_ClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("Profile not found")
                );

        return new ProfileDto(
                profile.getId(),
                profile.getFullName(),
                profile.getUsername(),
                profile.getBio(),
                profile.getProfileImage(),
                profile.getCollege(),
                profile.getDepartment(),
                profile.getYear(),
                profile.getInterests(),
                profile.getProfileCompleted()
        );
    }

    public Profile createProfile(String clerkId, CreateProfileDto dto, MultipartFile profileImage) throws IOException {
        Users user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (profileRepository.existsByUser_ClerkId(clerkId)) {
            throw new RuntimeException("Profile already exists");
        }

        String imageUrl = null;

        if (profileImage != null && !profileImage.isEmpty()) {
            imageUrl = cloudinaryService.uploadProfileImage(
                    profileImage
            );
        }

        Profile profile = Profile.builder()
                .user(user)
                .fullName(dto.fullName())
                .username(dto.username())
                .bio(dto.bio())
                .college(dto.college())
                .department(dto.department())
                .year(dto.year())
                .interests(dto.interests())
                .profileImage(imageUrl)
                .profileCompleted(true)
                .build();

        return profileRepository.save(profile);
    }
}

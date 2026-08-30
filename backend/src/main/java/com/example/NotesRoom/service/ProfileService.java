package com.example.NotesRoom.service;

import java.io.IOException;

import com.example.NotesRoom.dto.profile.UpdateProfileDto;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.NotesRoom.dto.profile.CreateProfileDto;
import com.example.NotesRoom.dto.profile.ProfileDto;
import com.example.NotesRoom.entity.Profile;
import com.example.NotesRoom.entity.Users;
import com.example.NotesRoom.error.ProfileNotFoundException;
import com.example.NotesRoom.repository.ProfileRepository;
import com.example.NotesRoom.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    public ProfileDto getProfile(String clerkId) {

        Profile profile = profileRepository
                .findByUser_ClerkId(clerkId)
                .orElseThrow(() -> new ProfileNotFoundException("Profile not found"));

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
                profile.getProfileCompleted());
    }

    public Profile createProfile(String clerkId, CreateProfileDto dto, MultipartFile profileImage)
            throws IOException {
        Users user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (profileRepository.existsByUser_ClerkId(clerkId)) {
            throw new RuntimeException("Profile already exists");
        }

        String imageUrl = null;

        if (profileImage != null && !profileImage.isEmpty()) {
            imageUrl = cloudinaryService.uploadProfileImage(
                    profileImage);
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

    @Transactional
    public ProfileDto updateProfile(
            String clerkId,
            UpdateProfileDto dto) {
        Profile profile = profileRepository
                .findByUser_ClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("Profile not found"));
        profile.setFullName(dto.fullName());
        profile.setUsername(dto.username());
        profile.setBio(dto.bio());
        profile.setCollege(dto.college());
        profile.setDepartment(dto.department());
        profile.setYear(dto.year());
        profile.setInterests(dto.interests());
        profile.setProfileImage(dto.profileImage());
        profile.setProfileCompleted(
                dto.fullName() != null &&
                        !dto.fullName().isBlank()
        );
        Profile profile1 = profileRepository.save(profile);

        return new ProfileDto(
                profile1.getId(),
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

    @Transactional
    public ProfileDto deleteProfileImage(String clerkId) throws IOException {
        Profile profile = profileRepository
                .findByUser_ClerkId(clerkId)
                .orElseThrow(() ->
                        new ProfileNotFoundException(
                                "Profile not found"
                        )
                );
        String oldImageUrl = profile.getProfileImage();
        // Delete from Cloudinary
        if (oldImageUrl != null &&
                !oldImageUrl.isBlank()) {
            cloudinaryService.deleteProfileImage(oldImageUrl);
        }
        // Remove URL from database
        profile.setProfileImage(null);
        Profile savedProfile = profileRepository.save(profile);
        return new ProfileDto(
                savedProfile.getId(),
                savedProfile.getFullName(),
                savedProfile.getUsername(),
                savedProfile.getBio(),
                savedProfile.getProfileImage(),
                savedProfile.getCollege(),
                savedProfile.getDepartment(),
                savedProfile.getYear(),
                savedProfile.getInterests(),
                savedProfile.getProfileCompleted()
        );
    }
}

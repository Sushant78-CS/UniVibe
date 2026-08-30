package com.example.NotesRoom.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.NotesRoom.dto.club.ClubApplicationActionDto;
import com.example.NotesRoom.dto.club.ClubApplicationDto;
import com.example.NotesRoom.dto.club.ClubApplicationStatus;
import com.example.NotesRoom.entity.Club;
import com.example.NotesRoom.entity.ClubApplication;
import com.example.NotesRoom.entity.Users;
import com.example.NotesRoom.error.ApplicationNotFoundException;
import com.example.NotesRoom.repository.ClubApplicationRepository;
import com.example.NotesRoom.repository.ClubRepository;
import com.example.NotesRoom.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClubApplicationService {

        private final ClubApplicationRepository applicationRepository;
        private final ClubRepository clubRepository;
        private final UserRepository userRepository;

        /**
         * Student applies to join a club.
         */
        @Transactional
        public ClubApplicationDto apply(
                        String clerkId,
                        Long clubId) {

                Users user = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Club club = clubRepository.findById(clubId)
                                .orElseThrow(() -> new RuntimeException("Club not found"));

                // Check existing application
                var existing = applicationRepository
                                .findByClub_IdAndUser_Id(
                                                clubId,
                                                user.getId());

                if (existing.isPresent()) {

                        ClubApplication application = existing.get();

                        if (application.getStatus() == ClubApplicationStatus.PENDING) {

                                throw new IllegalArgumentException(
                                                "Application already pending");
                        }

                        if (application.getStatus() == ClubApplicationStatus.ACCEPTED) {

                                throw new IllegalArgumentException(
                                                "You are already a member of this club");
                        }

                        // If previously rejected, allow applying again
                        application.setStatus(
                                        ClubApplicationStatus.PENDING);

                        application.setAppliedAt(
                                        LocalDateTime.now());

                        application.setUpdatedAt(
                                        LocalDateTime.now());

                        return toDto(
                                        applicationRepository.save(application));
                }

                ClubApplication application = ClubApplication.builder()
                                .club(club)
                                .user(user)
                                .status(ClubApplicationStatus.PENDING)
                                .appliedAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .build();

                return toDto(
                                applicationRepository.save(application));
        }

        /**
         * Get current user's application for a club.
         */
        public ClubApplicationDto getMyApplication(
                        String clerkId,
                        Long clubId) {

                Users user = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                ClubApplication application = applicationRepository
                                .findByClub_IdAndUser_Id(
                                                clubId,
                                                user.getId())
                                .orElseThrow(() -> new ApplicationNotFoundException(
                                                "Application not found"));

                return toDto(application);
        }

        /**
         * Withdraw a pending application.
         */
        @Transactional
        public void withdraw(
                        String clerkId,
                        Long clubId) {

                Users user = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                ClubApplication application = applicationRepository
                                .findByClub_IdAndUser_Id(
                                                clubId,
                                                user.getId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Application not found"));

                if (application.getStatus() != ClubApplicationStatus.PENDING) {

                        throw new IllegalArgumentException(
                                        "Only pending applications can be withdrawn");
                }

                applicationRepository.delete(application);
        }

        /**
         * Admin gets all pending applications for a club.
         */
        public List<ClubApplicationDto> getPendingApplications(
                        Long clubId) {

                if (!clubRepository.existsById(clubId)) {
                        throw new RuntimeException("Club not found");
                }

                return applicationRepository
                                .findByClub_IdAndStatus(
                                                clubId,
                                                ClubApplicationStatus.PENDING)
                                .stream()
                                .map(this::toDto)
                                .toList();
        }

        /**
         * Admin accepts/rejects an application.
         */
        @Transactional
        public ClubApplicationDto updateApplication(
                        Long applicationId,
                        ClubApplicationActionDto dto) {

                ClubApplication application = applicationRepository.findById(applicationId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Application not found"));

                if (application.getStatus() != ClubApplicationStatus.PENDING) {

                        throw new IllegalArgumentException(
                                        "Application has already been handled");
                }

                ClubApplicationStatus newStatus;

                if ("ACCEPT".equalsIgnoreCase(dto.action())) {

                        newStatus = ClubApplicationStatus.ACCEPTED;

                } else if ("REJECT".equalsIgnoreCase(dto.action())) {

                        newStatus = ClubApplicationStatus.REJECTED;

                } else {

                        throw new IllegalArgumentException(
                                        "Invalid application action");
                }

                application.setStatus(newStatus);
                application.setUpdatedAt(LocalDateTime.now());

                return toDto(
                                applicationRepository.save(application));
        }

        /**
         * Convert entity to DTO.
         */
        private ClubApplicationDto toDto(
                        ClubApplication application) {

                return new ClubApplicationDto(
                                application.getId(),
                                application.getClub().getId(),
                                application.getClub().getName(),
                                application.getUser().getId(),
                                application.getUser()
                                                .getProfile()
                                                .getId(),
                                application.getUser()
                                                .getProfile()
                                                .getFullName(),
                                application.getUser()
                                                .getProfile()
                                                .getUsername(),
                                application.getUser()
                                                .getProfile()
                                                .getProfileImage(),
                                application.getStatus(),
                                application.getAppliedAt(),
                                application.getUpdatedAt());
        }
}
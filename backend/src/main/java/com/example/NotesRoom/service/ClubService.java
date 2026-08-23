package com.example.NotesRoom.service;

import com.example.NotesRoom.dto.club.ClubDetailsDto;
import com.example.NotesRoom.dto.club.ClubDto;
import com.example.NotesRoom.dto.club.ClubMemberDto;
import com.example.NotesRoom.dto.club.ClubMemberRole;
import com.example.NotesRoom.entity.*;
import com.example.NotesRoom.repository.ClubMemberRepository;
import com.example.NotesRoom.repository.ClubRepository;
import com.example.NotesRoom.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClubService {
    private final ClubRepository clubRepository;
    private final ClubMemberRepository clubMemberRepository;
    private final UserRepository userRepository;

    public List<ClubDto> getClubs() {
        return clubRepository.findAll()
                .stream()
                .map(club -> new ClubDto(
                        club.getId(),
                        club.getName(),
                        club.getDescription(),
                        club.getCategory(),
                        club.getImage(),
                        club.getMembers().size()
                ))
                .toList();
    }

    public List<ClubMemberDto> getMembers(Long clubId) {
        if (!clubRepository.existsById(clubId)) {
            throw new RuntimeException("Club not found");
        }
        return clubMemberRepository
                .findByClub_Id(clubId)
                .stream()
                .map(member -> {
                    Profile profile =
                            member.getUser().getProfile();
                    return new ClubMemberDto(
                            profile.getId(),
                            profile.getFullName(),
                            profile.getUsername(),
                            profile.getProfileImage(),
                            profile.getDepartment(),
                            profile.getYear(),
                            member.getRole().name()
                    );
                }).toList();
    }

    public void joinClub(
            Long clubId,
            String clerkId
    ) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() ->
                        new RuntimeException("Club not found"));
        Users user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
        if (clubMemberRepository
                .existsByClub_IdAndUser_ClerkId(
                        clubId,
                        clerkId
                )) {
            throw new IllegalArgumentException(
                    "Already joined this club"
            );
        }
        ClubMember member = ClubMember.builder()
                .club(club)
                .user(user)
                .role(ClubMemberRole.MEMBER)
                .build();
        clubMemberRepository.save(member);
    }

    public void leaveClub(
            Long clubId,
            String clerkId
    ) {
        if (!clubMemberRepository
                .existsByClub_IdAndUser_ClerkId(
                        clubId,
                        clerkId)) {
            throw new RuntimeException(
                    "You are not a member of this club"
            );
        }
        clubMemberRepository
                .deleteByClub_IdAndUser_ClerkId(
                        clubId,
                        clerkId
                );
    }

    public boolean isMember(
            Long clubId,
            String clerkId) {
        return clubMemberRepository
                .existsByClub_IdAndUser_ClerkId(
                        clubId,
                        clerkId
                );
    }

    public List<ClubDto> getMyClubs(String clerkId) {
        return clubMemberRepository
                .findByUser_ClerkId(clerkId)
                .stream()
                .map(member -> {
                    Club club = member.getClub();
                    return new ClubDto(
                            club.getId(),
                            club.getName(),
                            club.getDescription(),
                            club.getCategory(),
                            club.getImage(),
                            club.getMembers().size()
                    );
                }).toList();
    }

    public ClubDetailsDto getClub(Long id) {

        Club club = clubRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Club not found")
                );

        return new ClubDetailsDto(
                club.getId(),
                club.getName(),
                club.getDescription(),
                club.getCategory(),
                club.getImage(),
                // use your existing member-count logic here
                club.getMembers() == null
                        ? 0L
                        : (long) club.getMembers().size()
        );
    }
}
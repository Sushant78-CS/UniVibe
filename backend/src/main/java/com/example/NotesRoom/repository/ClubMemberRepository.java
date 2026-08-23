package com.example.NotesRoom.repository;

import com.example.NotesRoom.entity.ClubMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClubMemberRepository extends JpaRepository<ClubMember, Long> {
    List<ClubMember> findByClub_Id(Long clubId);

    Optional<ClubMember> findByClub_IdAndUser_ClerkId(
            Long clubId,
            String clerkId
    );

    boolean existsByClub_IdAndUser_ClerkId(
            Long clubId,
            String clerkId
    );

    void deleteByClub_IdAndUser_ClerkId(
            Long clubId,
            String clerkId
    );

    List<ClubMember> findByUser_ClerkId(String clerkId);

}

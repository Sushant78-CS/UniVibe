package com.example.NotesRoom.repository;

import com.example.NotesRoom.dto.club.ClubApplicationStatus;
import com.example.NotesRoom.entity.ClubApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClubApplicationRepository
        extends JpaRepository<ClubApplication, Long> {

    Optional<ClubApplication>
    findByClub_IdAndUser_Id(
            Long clubId,
            Long userId
    );

    List<ClubApplication>
    findByClub_IdAndStatus(
            Long clubId,
            ClubApplicationStatus status
    );

    List<ClubApplication>
    findByUser_IdAndStatus(
            Long userId,
            ClubApplicationStatus status
    );

    List<ClubApplication> findByUser_Id(Long userId);

    List<ClubApplication> findByClub_Id(Long clubId);

    List<ClubApplication> findByStatus(ClubApplicationStatus status);
}

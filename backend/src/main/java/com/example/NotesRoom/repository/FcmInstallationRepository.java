package com.example.NotesRoom.repository;

import com.example.NotesRoom.entity.FcmInstallation;
import com.example.NotesRoom.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FcmInstallationRepository
        extends JpaRepository<FcmInstallation, Long> {

    Optional<FcmInstallation> findByFid(String fid);

    List<FcmInstallation> findAllByUser(Users user);

    void deleteByFid(String fid);
}
package com.example.NotesRoom.repository;

import com.example.NotesRoom.entity.VibeMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VibeMessageRepository
        extends JpaRepository<VibeMessage, Long> {

    List<VibeMessage> findAllByOrderByCreatedAtDesc(
            Pageable pageable
    );
}
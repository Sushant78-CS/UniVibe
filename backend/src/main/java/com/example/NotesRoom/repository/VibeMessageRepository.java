package com.example.NotesRoom.repository;

import com.example.NotesRoom.entity.VibeMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface VibeMessageRepository
        extends JpaRepository<VibeMessage, Long> {

    List<VibeMessage> findAllByOrderByCreatedAtDesc(
            Pageable pageable
    );

    @Modifying
    @Query("""
                delete from VibeMessage m
                where m.createdAt < :expiryTime
            """)
    int deleteMessagesOlderThan(
            @Param("expiryTime") Instant expiryTime
    );
}
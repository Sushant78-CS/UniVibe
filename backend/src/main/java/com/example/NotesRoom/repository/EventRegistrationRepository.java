package com.example.NotesRoom.repository;

import com.example.NotesRoom.entity.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRegistrationRepository
        extends JpaRepository<EventRegistration, Long> {

    boolean existsByEventIdAndUserId(
            Long eventId,
            Long userId
    );

    long countByEventId(Long eventId);

    List<EventRegistration> findAllByEventIdOrderBySubmittedAtDesc(
            Long eventId
    );

    void deleteByEventId(Long eventId);
}
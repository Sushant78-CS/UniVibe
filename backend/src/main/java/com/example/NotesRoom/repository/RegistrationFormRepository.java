package com.example.NotesRoom.repository;

import com.example.NotesRoom.entity.RegistrationForm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RegistrationFormRepository
        extends JpaRepository<RegistrationForm, Long> {

    Optional<RegistrationForm> findByEventId(Long eventId);

    boolean existsByEventId(Long eventId);

    void deleteByEventId(Long eventId);
}
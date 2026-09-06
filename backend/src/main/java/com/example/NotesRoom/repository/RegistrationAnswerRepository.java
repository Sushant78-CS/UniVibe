package com.example.NotesRoom.repository;

import com.example.NotesRoom.entity.RegistrationAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegistrationAnswerRepository
        extends JpaRepository<RegistrationAnswer, Long> {

    List<RegistrationAnswer> findAllByRegistrationId(
            Long registrationId
    );

    void deleteByRegistrationEventId(Long eventId);

    void deleteByQuestionFormEventId(Long eventId);
}
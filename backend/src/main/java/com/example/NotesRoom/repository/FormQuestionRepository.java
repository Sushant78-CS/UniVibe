package com.example.NotesRoom.repository;

import com.example.NotesRoom.entity.FormQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FormQuestionRepository
        extends JpaRepository<FormQuestion, Long> {

    List<FormQuestion> findAllByFormIdOrderByDisplayOrderAsc(
            Long formId
    );

    void deleteByFormEventId(Long eventId);
}
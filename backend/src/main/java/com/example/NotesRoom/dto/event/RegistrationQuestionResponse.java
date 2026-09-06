package com.example.NotesRoom.dto.event;

public record RegistrationQuestionResponse(
        Long id,
        String question,
        String type,
        boolean required,
        String options,
        Integer displayOrder
) {}
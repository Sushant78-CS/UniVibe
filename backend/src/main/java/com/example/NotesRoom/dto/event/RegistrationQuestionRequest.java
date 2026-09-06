package com.example.NotesRoom.dto.event;

public record RegistrationQuestionRequest(
        String question,
        String type,
        boolean required,
        String options,
        Integer displayOrder
) {}
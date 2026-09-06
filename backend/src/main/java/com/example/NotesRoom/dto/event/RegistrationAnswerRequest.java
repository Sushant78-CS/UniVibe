package com.example.NotesRoom.dto.event;

public record RegistrationAnswerRequest(
        Long questionId,
        String answer
) {}
package com.example.NotesRoom.dto.event;

public record RegistrationAnswerResponseDto(
        Long questionId,
        String question,
        String answer
) {
}
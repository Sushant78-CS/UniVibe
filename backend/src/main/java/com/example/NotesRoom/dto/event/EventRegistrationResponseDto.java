package com.example.NotesRoom.dto.event;

import java.time.Instant;
import java.util.List;

public record EventRegistrationResponseDto(
        Long registrationId,
        Long userId,
        String studentName,
        String username,
        String submittedAt,
        List<RegistrationAnswerResponseDto> answers
) {}

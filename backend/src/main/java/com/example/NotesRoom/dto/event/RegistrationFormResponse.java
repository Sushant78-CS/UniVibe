package com.example.NotesRoom.dto.event;

import java.time.Instant;
import java.util.List;

public record RegistrationFormResponse(
        Long id,
        Long eventId,
        Instant createdAt,
        List<RegistrationQuestionResponse> questions
) {}
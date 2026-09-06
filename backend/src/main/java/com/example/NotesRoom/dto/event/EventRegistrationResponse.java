package com.example.NotesRoom.dto.event;

import java.time.Instant;

public record EventRegistrationResponse(
        Long id,
        Long eventId,
        Instant submittedAt
) {}
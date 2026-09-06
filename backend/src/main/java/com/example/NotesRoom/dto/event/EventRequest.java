package com.example.NotesRoom.dto.event;

import java.time.Instant;

public record EventRequest(
        String title,
        String description,
        String imageUrl,
        String location,
        Instant startTime,
        Instant endTime,
        Instant registrationDeadline,
        Integer capacity,
        boolean registrationEnabled
) {}
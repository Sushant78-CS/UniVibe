package com.example.NotesRoom.dto.event;

import java.time.Instant;

public record EventResponse(
        Long id,
        String title,
        String description,
        String imageUrl,
        String location,
        Instant startTime,
        Instant endTime,
        Instant registrationDeadline,
        Integer capacity,
        boolean registrationEnabled,
        String organizerName,
        Instant createdAt,

        long registrationCount,
        boolean registeredByCurrentUser,
        boolean registrationOpen
) {}
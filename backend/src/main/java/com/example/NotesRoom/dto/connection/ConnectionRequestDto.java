package com.example.NotesRoom.dto.connection;


public record ConnectionRequestDto(
        Long id,
        Long profileId,
        String fullName,
        String username,
        String profileImage,
        ConnectionStatus status
) {}
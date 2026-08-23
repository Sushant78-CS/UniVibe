package com.example.NotesRoom.dto.connection;

public record ConnectedPersonDto(
        Long connectionId,
        Long profileId,
        String fullName,
        String username,
        String profileImage
) {
}
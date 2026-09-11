package com.example.NotesRoom.dto.connection;

import java.util.List;

public record ConnectionPageResponse(
        List<ConnectedPersonDto> connections,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean last
) {
}

package com.example.NotesRoom.dto.event;

import java.util.List;

public record EventRegistrationRequest(
        List<RegistrationAnswerRequest> answers
) {}
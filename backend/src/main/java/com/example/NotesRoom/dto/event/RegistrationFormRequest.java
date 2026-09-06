package com.example.NotesRoom.dto.event;

import java.util.List;

public record RegistrationFormRequest(
        List<RegistrationQuestionRequest> questions
) {}
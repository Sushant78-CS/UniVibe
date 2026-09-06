package com.example.NotesRoom.service;

import com.example.NotesRoom.dto.event.RegistrationFormRequest;
import com.example.NotesRoom.dto.event.RegistrationFormResponse;
import com.example.NotesRoom.dto.event.RegistrationQuestionRequest;
import com.example.NotesRoom.dto.event.RegistrationQuestionResponse;
import com.example.NotesRoom.dto.user.UserRole;
import com.example.NotesRoom.entity.Event;
import com.example.NotesRoom.entity.FormQuestion;
import com.example.NotesRoom.entity.RegistrationForm;
import com.example.NotesRoom.entity.Users;
import com.example.NotesRoom.repository.EventRepository;
import com.example.NotesRoom.repository.FormQuestionRepository;
import com.example.NotesRoom.repository.RegistrationFormRepository;
import com.example.NotesRoom.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RegistrationFormService {

    private final RegistrationFormRepository registrationFormRepository;
    private final FormQuestionRepository formQuestionRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    /**
     * Create a registration form for an event.
     * Only admins can perform this operation.
     */
    @Transactional
    public RegistrationFormResponse createForm(
            String clerkId,
            Long eventId,
            RegistrationFormRequest request
    ) {

        Users admin = getUser(clerkId);

        checkAdmin(admin);

        Event event = getEvent(eventId);

        if (!event.isRegistrationEnabled()) {
            throw new IllegalArgumentException(
                    "Registration is not enabled for this event"
            );
        }

        if (registrationFormRepository.existsByEventId(eventId)) {
            throw new IllegalArgumentException(
                    "Registration form already exists for this event"
            );
        }

        validateRequest(request);

        RegistrationForm form = RegistrationForm.builder()
                .event(event)
                .createdAt(Instant.now())
                .build();

        RegistrationForm savedForm =
                registrationFormRepository.save(form);

        saveQuestions(savedForm, request.questions());

        return toResponse(savedForm);
    }

    /**
     * Get the registration form for an event.
     */
    @Transactional(readOnly = true)
    public RegistrationFormResponse getForm(
            Long eventId
    ) {

        RegistrationForm form =
                registrationFormRepository
                        .findByEventId(eventId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Registration form not found"
                                )
                        );

        return toResponse(form);
    }

    /**
     * Update an existing registration form.
     * Only admins can perform this operation.
     */
    @Transactional
    public RegistrationFormResponse updateForm(
            String clerkId,
            Long eventId,
            RegistrationFormRequest request
    ) {

        Users admin = getUser(clerkId);

        checkAdmin(admin);

        Event event = getEvent(eventId);

        if (!event.isRegistrationEnabled()) {
            throw new IllegalArgumentException(
                    "Registration is not enabled for this event"
            );
        }

        validateRequest(request);

        RegistrationForm form =
                registrationFormRepository
                        .findByEventId(eventId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Registration form not found"
                                )
                        );

        /*
         * For V1, replace the existing questions
         * with the newly submitted questions.
         */
        List<FormQuestion> existingQuestions =
                formQuestionRepository
                        .findAllByFormIdOrderByDisplayOrderAsc(
                                form.getId()
                        );

        if (!existingQuestions.isEmpty()) {
            formQuestionRepository.deleteAll(
                    existingQuestions
            );
        }

        saveQuestions(form, request.questions());

        return toResponse(form);
    }

    private void saveQuestions(
            RegistrationForm form,
            List<RegistrationQuestionRequest> questions
    ) {

        if (questions == null || questions.isEmpty()) {
            return;
        }

        for (int i = 0; i < questions.size(); i++) {

            RegistrationQuestionRequest request =
                    questions.get(i);

            FormQuestion question = FormQuestion.builder()
                    .form(form)
                    .question(request.question().trim())
                    .type(request.type().trim().toUpperCase())
                    .required(request.required())
                    .options(normalize(request.options()))
                    .displayOrder(i)
                    .build();

            formQuestionRepository.save(question);
        }
    }

    private RegistrationFormResponse toResponse(
            RegistrationForm form
    ) {

        List<FormQuestion> questions =
                formQuestionRepository
                        .findAllByFormIdOrderByDisplayOrderAsc(
                                form.getId()
                        );

        List<RegistrationQuestionResponse> questionResponses =
                questions.stream()
                        .map(question ->
                                new RegistrationQuestionResponse(
                                        question.getId(),
                                        question.getQuestion(),
                                        question.getType(),
                                        question.isRequired(),
                                        question.getOptions(),
                                        question.getDisplayOrder()
                                )
                        )
                        .toList();

        return new RegistrationFormResponse(
                form.getId(),
                form.getEvent().getId(),
                form.getCreatedAt(),
                questionResponses
        );
    }

    private void validateRequest(
            RegistrationFormRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Registration form is required"
            );
        }

        if (request.questions() == null ||
                request.questions().isEmpty()) {

            throw new IllegalArgumentException(
                    "At least one registration question is required"
            );
        }

        if (request.questions().size() > 30) {
            throw new IllegalArgumentException(
                    "A registration form cannot have more than 30 questions"
            );
        }

        for (RegistrationQuestionRequest question :
                request.questions()) {

            if (question == null) {
                throw new IllegalArgumentException(
                        "Invalid registration question"
                );
            }

            if (question.question() == null ||
                    question.question().isBlank()) {

                throw new IllegalArgumentException(
                        "Question text is required"
                );
            }

            if (question.question().trim().length() > 500) {
                throw new IllegalArgumentException(
                        "Question text cannot exceed 500 characters"
                );
            }

            if (question.type() == null ||
                    question.type().isBlank()) {

                throw new IllegalArgumentException(
                        "Question type is required"
                );
            }

            String type =
                    question.type().trim().toUpperCase();

            if (!isValidType(type)) {
                throw new IllegalArgumentException(
                        "Invalid question type: " + type
                );
            }

            if (requiresOptions(type)) {

                if (question.options() == null ||
                        question.options().isBlank()) {

                    throw new IllegalArgumentException(
                            "Options are required for " + type
                    );
                }
            }
        }
    }

    private boolean isValidType(String type) {

        return switch (type) {
            case "TEXT",
                 "EMAIL",
                 "PHONE",
                 "NUMBER",
                 "TEXTAREA",
                 "SELECT",
                 "RADIO",
                 "CHECKBOX" -> true;

            default -> false;
        };
    }

    private boolean requiresOptions(String type) {

        return type.equals("SELECT") ||
                type.equals("RADIO") ||
                type.equals("CHECKBOX");
    }

    private Users getUser(String clerkId) {

        return userRepository.findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );
    }

    private Event getEvent(Long eventId) {

        return eventRepository.findById(eventId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Event not found"
                        )
                );
    }

    private void checkAdmin(Users user) {

        if (user.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException(
                    "Only admins can manage registration forms"
            );
        }
    }

    private String normalize(String value) {

        if (value == null ||
                value.isBlank()) {

            return null;
        }

        return value.trim();
    }
}
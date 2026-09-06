package com.example.NotesRoom.service;

import com.example.NotesRoom.dto.event.*;
import com.example.NotesRoom.dto.user.UserRole;
import com.example.NotesRoom.entity.Event;
import com.example.NotesRoom.entity.EventRegistration;
import com.example.NotesRoom.entity.FormQuestion;
import com.example.NotesRoom.entity.RegistrationAnswer;
import com.example.NotesRoom.entity.RegistrationForm;
import com.example.NotesRoom.entity.Users;
import com.example.NotesRoom.repository.EventRegistrationRepository;
import com.example.NotesRoom.repository.EventRepository;
import com.example.NotesRoom.repository.FormQuestionRepository;
import com.example.NotesRoom.repository.RegistrationAnswerRepository;
import com.example.NotesRoom.repository.RegistrationFormRepository;
import com.example.NotesRoom.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class EventRegistrationService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final RegistrationFormRepository registrationFormRepository;
    private final FormQuestionRepository formQuestionRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final RegistrationAnswerRepository registrationAnswerRepository;

    @Transactional
    public EventRegistrationResponse register(
            String clerkId,
            Long eventId,
            EventRegistrationRequest request
    ) {
        Users user = getUser(clerkId);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() ->
                        new RuntimeException("Event not found")
                );

        if (!event.isRegistrationEnabled()) {
            throw new IllegalArgumentException(
                    "Registration is not enabled for this event"
            );
        }

        Instant now = Instant.now();

        if (event.getRegistrationDeadline() != null &&
                now.isAfter(event.getRegistrationDeadline())) {

            throw new IllegalArgumentException(
                    "Registration deadline has passed"
            );
        }

        if (event.getCapacity() != null) {

            long registrationCount =
                    eventRegistrationRepository
                            .countByEventId(eventId);

            if (registrationCount >= event.getCapacity()) {
                throw new IllegalArgumentException(
                        "Registration capacity has been reached"
                );
            }
        }

        if (eventRegistrationRepository
                .existsByEventIdAndUserId(
                        eventId,
                        user.getId()
                )) {

            throw new IllegalArgumentException(
                    "You have already registered for this event"
            );
        }

        RegistrationForm form =
                registrationFormRepository
                        .findByEventId(eventId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Registration form not found"
                                )
                        );

        List<FormQuestion> questions =
                formQuestionRepository
                        .findAllByFormIdOrderByDisplayOrderAsc(
                                form.getId()
                        );

        validateAnswers(
                questions,
                request
        );

        EventRegistration registration =
                EventRegistration.builder()
                        .event(event)
                        .user(user)
                        .submittedAt(now)
                        .build();

        EventRegistration savedRegistration =
                eventRegistrationRepository.save(
                        registration
                );

        Map<Long, RegistrationAnswerRequest> submittedAnswers =
                new HashMap<>();

        for (RegistrationAnswerRequest answer :
                request.answers()) {

            submittedAnswers.put(
                    answer.questionId(),
                    answer
            );
        }

        for (FormQuestion question : questions) {

            RegistrationAnswerRequest submitted =
                    submittedAnswers.get(
                            question.getId()
                    );

            if (submitted == null) {
                continue;
            }

            RegistrationAnswer answer =
                    RegistrationAnswer.builder()
                            .registration(
                                    savedRegistration
                            )
                            .question(question)
                            .answer(
                                    normalize(
                                            submitted.answer()
                                    )
                            )
                            .build();

            registrationAnswerRepository.save(answer);
        }

        return new EventRegistrationResponse(
                savedRegistration.getId(),
                event.getId(),
                savedRegistration.getSubmittedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<EventRegistrationResponseDto> getEventRegistrations(
            String clerkId,
            Long eventId
    ) {
        Users admin = userRepository.findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        if (admin.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Only admins can view event registrations");
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() ->
                        new RuntimeException("Event not found")
                );

        return eventRegistrationRepository
                .findAllByEventIdOrderBySubmittedAtDesc(event.getId())
                .stream()
                .map(this::toResponseDto)
                .toList();
    }

    private void validateAnswers(
            List<FormQuestion> questions,
            EventRegistrationRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Registration data is required"
            );
        }

        if (request.answers() == null) {
            throw new IllegalArgumentException(
                    "Registration answers are required"
            );
        }

        Set<Long> validQuestionIds = new HashSet<>();

        for (FormQuestion question : questions) {
            validQuestionIds.add(question.getId());
        }

        Set<Long> submittedQuestionIds = new HashSet<>();

        for (RegistrationAnswerRequest answer :
                request.answers()) {

            if (answer == null ||
                    answer.questionId() == null) {

                throw new IllegalArgumentException(
                        "Invalid registration answer"
                );
            }

            if (!validQuestionIds.contains(
                    answer.questionId()
            )) {

                throw new IllegalArgumentException(
                        "Invalid registration question"
                );
            }

            if (!submittedQuestionIds.add(
                    answer.questionId()
            )) {

                throw new IllegalArgumentException(
                        "Duplicate registration answer"
                );
            }
        }

        for (FormQuestion question : questions) {

            RegistrationAnswerRequest answer =
                    request.answers()
                            .stream()
                            .filter(item ->
                                    item != null &&
                                            question.getId()
                                                    .equals(
                                                            item.questionId()
                                                    )
                            )
                            .findFirst()
                            .orElse(null);

            String value =
                    answer == null
                            ? null
                            : normalize(answer.answer());

            if (question.isRequired() &&
                    (value == null || value.isBlank())) {

                throw new IllegalArgumentException(
                        "Please answer: "
                                + question.getQuestion()
                );
            }
        }
    }

    private Users getUser(String clerkId) {

        return userRepository.findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );
    }

    private String normalize(String value) {

        if (value == null ||
                value.isBlank()) {

            return null;
        }

        return value.trim();
    }

    private EventRegistrationResponseDto toResponseDto(
            EventRegistration registration
    ) {
        Users user = registration.getUser();

        String studentName = null;
        String username = null;

        if (user.getProfile() != null) {
            studentName = user.getProfile().getFullName();
        }

        /*
         * If your Users entity has a username field, use it here.
         * Otherwise the profile username is used.
         */
        if (user.getProfile() != null) {
            username = user.getProfile().getUsername();
        }

        List<RegistrationAnswerResponseDto> answers =
                registrationAnswerRepository
                        .findAllByRegistrationId(
                                registration.getId()
                        )
                        .stream()
                        .map(answer ->
                                new RegistrationAnswerResponseDto(
                                        answer.getQuestion().getId(),
                                        answer.getQuestion().getQuestion(),
                                        answer.getAnswer()
                                )
                        )
                        .toList();

        return new EventRegistrationResponseDto(
                registration.getId(),
                user.getId(),
                studentName,
                username,
                registration.getSubmittedAt().toString(),
                answers
        );
    }
}
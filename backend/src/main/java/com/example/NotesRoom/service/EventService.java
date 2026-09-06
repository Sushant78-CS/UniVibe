package com.example.NotesRoom.service;

import com.example.NotesRoom.dto.event.EventRequest;
import com.example.NotesRoom.dto.event.EventResponse;
import com.example.NotesRoom.dto.user.UserRole;
import com.example.NotesRoom.entity.Event;
import com.example.NotesRoom.entity.Users;
import com.example.NotesRoom.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final RegistrationFormRepository registrationFormRepository;
    private final FormQuestionRepository formQuestionRepository;
    private final RegistrationAnswerRepository registrationAnswerRepository;

    @Transactional
    public EventResponse createEvent(
            String clerkId,
            EventRequest request
    ) {

        Users admin = getUser(clerkId);

        if (!isAdmin(admin)) {
            throw new AccessDeniedException(
                    "Only admins can create events"
            );
        }

        validateEvent(request);

        Event event = Event.builder()
                .title(request.title().trim())
                .description(normalize(request.description()))
                .imageUrl(normalize(request.imageUrl()))
                .location(normalize(request.location()))
                .startTime(request.startTime())
                .endTime(request.endTime())
                .registrationDeadline(
                        request.registrationEnabled()
                                ? request.registrationDeadline()
                                : null
                )
                .capacity(
                        request.registrationEnabled()
                                ? request.capacity()
                                : null
                )
                .registrationEnabled(
                        request.registrationEnabled()
                )
                .createdBy(admin)
                .build();

        Event savedEvent =
                eventRepository.save(event);

        return toResponse(
                savedEvent,
                admin
        );
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getEvents(
            String clerkId
    ) {

        Users currentUser = getUser(clerkId);

        return eventRepository
                .findAllByOrderByStartTimeAsc()
                .stream()
                .map(event ->
                        toResponse(
                                event,
                                currentUser
                        )
                )
                .toList();
    }

    @Transactional(readOnly = true)
    public EventResponse getEvent(
            String clerkId,
            Long eventId
    ) {

        Users currentUser =
                getUser(clerkId);

        Event event =
                eventRepository.findById(eventId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Event not found"
                                )
                        );

        return toResponse(
                event,
                currentUser
        );
    }

    @Transactional
    public EventResponse updateEvent(
            String clerkId,
            Long eventId,
            EventRequest request
    ) {

        Users admin = getUser(clerkId);

        if (!isAdmin(admin)) {
            throw new AccessDeniedException(
                    "Only admins can update events"
            );
        }

        Event event =
                eventRepository.findById(eventId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Event not found"
                                )
                        );

        validateEvent(request);

        event.setTitle(
                request.title().trim()
        );

        event.setDescription(
                normalize(request.description())
        );

        event.setImageUrl(
                normalize(request.imageUrl())
        );

        event.setLocation(
                normalize(request.location())
        );

        event.setStartTime(
                request.startTime()
        );

        event.setEndTime(
                request.endTime()
        );

        event.setRegistrationEnabled(
                request.registrationEnabled()
        );

        if (request.registrationEnabled()) {

            event.setRegistrationDeadline(
                    request.registrationDeadline()
            );

            event.setCapacity(
                    request.capacity()
            );

        } else {

            event.setRegistrationDeadline(null);
            event.setCapacity(null);
        }

        Event updatedEvent =
                eventRepository.save(event);

        return toResponse(
                updatedEvent,
                admin
        );
    }

    @Transactional
    public void deleteEvent(
            String clerkId,
            Long eventId
    ) {
        Users admin = getUser(clerkId);

        if (!isAdmin(admin)) {
            throw new AccessDeniedException(
                    "Only admins can delete events"
            );
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() ->
                        new RuntimeException("Event not found")
                );

        /*
         * 1. Delete answers belonging to event registrations.
         */
        registrationAnswerRepository
                .deleteByRegistrationEventId(eventId);

        /*
         * 2. Delete answers belonging to the event's form questions.
         *
         * This is needed because RegistrationAnswer also has
         * a foreign key to FormQuestion.
         */
        registrationAnswerRepository
                .deleteByQuestionFormEventId(eventId);

        /*
         * 3. Delete event registrations.
         */
        eventRegistrationRepository
                .deleteByEventId(eventId);

        /*
         * 4. Delete form questions.
         */
        formQuestionRepository
                .deleteByFormEventId(eventId);

        /*
         * 5. Delete the registration form.
         */
        registrationFormRepository
                .deleteByEventId(eventId);

        /*
         * 6. Finally delete the event.
         */
        eventRepository.delete(event);
    }

    private Users getUser(String clerkId) {

        return userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );
    }

    private boolean isAdmin(Users user) {

        return user.getRole() == UserRole.ADMIN;
    }

    private void validateEvent(
            EventRequest request
    ) {

        if (request.title() == null ||
                request.title().isBlank()) {

            throw new IllegalArgumentException(
                    "Event title is required"
            );
        }

        if (request.startTime() == null) {

            throw new IllegalArgumentException(
                    "Event start time is required"
            );
        }

        if (request.endTime() != null &&
                request.endTime()
                        .isBefore(request.startTime())) {

            throw new IllegalArgumentException(
                    "Event end time must be after start time"
            );
        }

        if (request.registrationEnabled()) {

            if (request.registrationDeadline() != null &&
                    request.registrationDeadline()
                            .isAfter(request.startTime())) {

                throw new IllegalArgumentException(
                        "Registration deadline must be before the event"
                );
            }

            if (request.capacity() != null &&
                    request.capacity() <= 0) {

                throw new IllegalArgumentException(
                        "Capacity must be greater than zero"
                );
            }
        }
    }

    private String normalize(String value) {

        if (value == null ||
                value.isBlank()) {

            return null;
        }

        return value.trim();
    }

    private EventResponse toResponse(
            Event event,
            Users currentUser
    ) {

        String organizerName = null;

        if (event.getCreatedBy() != null &&
                event.getCreatedBy().getProfile() != null) {

            organizerName =
                    event.getCreatedBy()
                            .getProfile()
                            .getFullName();
        }

        long registrationCount =
                eventRegistrationRepository
                        .countByEventId(
                                event.getId()
                        );

        boolean registeredByCurrentUser =
                eventRegistrationRepository
                        .existsByEventIdAndUserId(
                                event.getId(),
                                currentUser.getId()
                        );

        boolean registrationOpen =
                isRegistrationOpen(
                        event,
                        registrationCount
                );

        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getImageUrl(),
                event.getLocation(),
                event.getStartTime(),
                event.getEndTime(),
                event.getRegistrationDeadline(),
                event.getCapacity(),
                event.isRegistrationEnabled(),
                organizerName,
                event.getCreatedAt(),

                registrationCount,
                registeredByCurrentUser,
                registrationOpen
        );
    }

    private boolean isRegistrationOpen(
            Event event,
            long registrationCount
    ) {

        if (!event.isRegistrationEnabled()) {
            return false;
        }

        if (event.getRegistrationDeadline() != null &&
                Instant.now().isAfter(
                        event.getRegistrationDeadline()
                )) {

            return false;
        }

        if (event.getCapacity() != null &&
                registrationCount >= event.getCapacity()) {

            return false;
        }

        return true;
    }
}
package com.example.NotesRoom.repository;

import com.example.NotesRoom.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findAllByOrderByStartTimeAsc();

    List<Event> findByStartTimeAfterOrderByStartTimeAsc(
            java.time.Instant now
    );
}
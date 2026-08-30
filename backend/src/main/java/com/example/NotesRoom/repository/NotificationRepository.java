package com.example.NotesRoom.repository;

import com.example.NotesRoom.entity.Notification;
import com.example.NotesRoom.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(
            Users user
    );

    List<Notification> findByUserAndReadFalseOrderByCreatedAtDesc(
            Users user
    );

    long countByUserAndReadFalse(Users user);
}

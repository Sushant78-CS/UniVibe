package com.example.NotesRoom.repository;

import com.example.NotesRoom.entity.Notification;
import com.example.NotesRoom.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(
            Users user
    );

    List<Notification> findByUserAndReadFalseOrderByCreatedAtDesc(
            Users user
    );

    long countByUserAndReadFalse(Users user);

    @Modifying
    @Query("""
                delete from Notification n
                where n.read = true
                  and n.readAt < :expiryTime
            """)
    int deleteExpiredReadNotifications(
            @Param("expiryTime") Instant expiryTime
    );
}

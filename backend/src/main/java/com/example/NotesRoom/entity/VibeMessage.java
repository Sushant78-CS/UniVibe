package com.example.NotesRoom.entity;

import com.example.NotesRoom.dto.post.MediaType;
import com.example.NotesRoom.dto.vibe.VibeMediaType;
import com.example.NotesRoom.entity.Users;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "vibe_messages")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VibeMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_id", nullable = false)
    private Users sender;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 1000)
    private String mediaUrl;

    @Enumerated(EnumType.STRING)
    private VibeMediaType mediaType;

    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
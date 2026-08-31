package com.example.NotesRoom.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "post_comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "post_id",
            nullable = false
    )
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private Users user;

    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String content;

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
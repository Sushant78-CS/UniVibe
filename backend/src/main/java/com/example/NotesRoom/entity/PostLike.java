package com.example.NotesRoom.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "post_likes",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_post_like_user",
                        columnNames = {"post_id", "user_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostLike {

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
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;
}
package com.example.NotesRoom.entity;

import com.example.NotesRoom.dto.club.ClubApplicationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "club_applications",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"club_id", "user_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ClubApplicationStatus status =
            ClubApplicationStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime appliedAt;

    private LocalDateTime updatedAt;
}

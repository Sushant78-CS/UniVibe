package com.example.NotesRoom.entity;

import com.example.NotesRoom.dto.club.ClubMemberRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "club_members",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"club_id", "user_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @Builder.Default
    private LocalDateTime joinedAt = LocalDateTime.now();

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private ClubMemberRole role = ClubMemberRole.MEMBER;
}
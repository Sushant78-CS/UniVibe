package com.example.NotesRoom.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // User who owns this profile
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            unique = true
    )
    private Users user;

    @Column(nullable = false)
    private String fullName;

    @Column(unique = true)
    private String username;

    @Column(length = 500)
    private String bio;

    private String profileImage;

    private String college;

    private String department;

    private String year;

    private String interests;

    @Builder.Default
    private Boolean profileCompleted = false;
}
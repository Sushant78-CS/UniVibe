package com.example.NotesRoom.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "clerk_id", unique = true, nullable = false)
    private String clerkId;

    @Column(unique = true, nullable = false)
    private String email;

    @OneToOne(
            mappedBy = "user",
            fetch = FetchType.LAZY
    )
    private Profile profile;

}

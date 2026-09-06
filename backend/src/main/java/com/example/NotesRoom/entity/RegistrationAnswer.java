package com.example.NotesRoom.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "registration_answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registration_id")
    private EventRegistration registration;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id")
    private FormQuestion question;

    @Column(columnDefinition = "TEXT")
    private String answer;
}
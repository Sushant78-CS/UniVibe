package com.example.NotesRoom.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "form_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "form_id")
    private RegistrationForm form;

    @Column(nullable = false)
    private String question;

    @Column(nullable = false)
    private String type;

    private boolean required;

    @Column(columnDefinition = "TEXT")
    private String options;

    private Integer displayOrder;
}
package com.example.NotesRoom.entity;

import com.example.NotesRoom.dto.post.MediaType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "post_media",
        indexes = {
                @Index(name = "idx_post_media_post_order", columnList = "post_id, display_order")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(nullable = false, length = 2000)
    private String mediaUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MediaType mediaType;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;
}

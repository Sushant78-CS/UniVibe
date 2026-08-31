package com.example.NotesRoom.repository;

import com.example.NotesRoom.entity.Post;
import com.example.NotesRoom.entity.PostComment;
import com.example.NotesRoom.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostCommentRepository extends JpaRepository<PostComment, Long> {

    List<PostComment> findByPostOrderByCreatedAtAsc(
            Post post
    );

    long countByPost(Post post);

    boolean existsByIdAndUser(
            Long id,
            Users user
    );
}
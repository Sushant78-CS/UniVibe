package com.example.NotesRoom.repository;

import com.example.NotesRoom.entity.Post;
import com.example.NotesRoom.entity.PostLike;
import com.example.NotesRoom.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    boolean existsByPostAndUser(
            Post post,
            Users user
    );

    void deleteByPostAndUser(
            Post post,
            Users user
    );

    long countByPost(Post post);
}
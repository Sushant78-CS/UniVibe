package com.example.NotesRoom.repository;

import com.example.NotesRoom.entity.Post;
import com.example.NotesRoom.entity.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
//    List<Post> findAllByOrderByCreatedAtDesc();
//
//    List<Post> findByUserOrderByCreatedAtDesc(Users user);

    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Post> findByUserOrderByCreatedAtDesc(
            Users user,
            Pageable pageable
    );

}

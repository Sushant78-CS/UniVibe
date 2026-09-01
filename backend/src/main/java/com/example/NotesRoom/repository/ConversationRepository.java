package com.example.NotesRoom.repository;

import com.example.NotesRoom.entity.Conversation;
import com.example.NotesRoom.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository
        extends JpaRepository<Conversation, Long> {

    Optional<Conversation> findByUserOneAndUserTwo(
            Users userOne,
            Users userTwo
    );

    Optional<Conversation> findByUserTwoAndUserOne(
            Users userTwo,
            Users userOne
    );

    List<Conversation> findByUserOneOrUserTwoOrderByUpdatedAtDesc(
            Users userOne,
            Users userTwo
    );
}
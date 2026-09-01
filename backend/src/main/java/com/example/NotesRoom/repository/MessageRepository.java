package com.example.NotesRoom.repository;

import com.example.NotesRoom.entity.Conversation;
import com.example.NotesRoom.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository
        extends JpaRepository<Message, Long> {

    List<Message> findByConversationOrderByCreatedAtAsc(
            Conversation conversation
    );
}
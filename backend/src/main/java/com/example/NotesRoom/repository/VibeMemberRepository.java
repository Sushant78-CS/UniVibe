package com.example.NotesRoom.repository;

import com.example.NotesRoom.entity.Users;
import com.example.NotesRoom.entity.VibeMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VibeMemberRepository
        extends JpaRepository<VibeMember, Long> {

    boolean existsByUser(Users user);

    Optional<VibeMember> findByUser(Users user);

    List<VibeMember> findAllBy();
}
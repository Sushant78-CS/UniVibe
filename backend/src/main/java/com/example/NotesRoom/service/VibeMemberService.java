package com.example.NotesRoom.service;

import com.example.NotesRoom.entity.Users;
import com.example.NotesRoom.entity.VibeMember;
import com.example.NotesRoom.repository.UserRepository;
import com.example.NotesRoom.repository.VibeMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VibeMemberService {

    private final UserRepository userRepository;
    private final VibeMemberRepository vibeMemberRepository;

    @Transactional(readOnly = true)
    public boolean isMember(String clerkId) {

        Users user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return vibeMemberRepository.existsByUser(user);
    }

    @Transactional
    public void join(String clerkId) {

        Users user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (vibeMemberRepository.existsByUser(user)) {
            return;
        }

        VibeMember member = VibeMember.builder()
                .user(user)
                .build();

        vibeMemberRepository.save(member);
    }

    @Transactional
    public void leave(String clerkId) {

        Users user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        vibeMemberRepository.findByUser(user)
                .ifPresent(vibeMemberRepository::delete);
    }
}
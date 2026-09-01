package com.example.NotesRoom.service;

import com.example.NotesRoom.dto.message.ConversationDto;
import com.example.NotesRoom.dto.message.CreateMessageDto;
import com.example.NotesRoom.dto.message.MessageDto;
import com.example.NotesRoom.entity.Conversation;
import com.example.NotesRoom.entity.Message;
import com.example.NotesRoom.entity.Profile;
import com.example.NotesRoom.entity.Users;
import com.example.NotesRoom.repository.ConversationRepository;
import com.example.NotesRoom.repository.MessageRepository;
import com.example.NotesRoom.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    // ==========================================
    // CREATE / GET CONVERSATION
    // ==========================================

    @Transactional
    public ConversationDto getOrCreateConversation(
            String clerkId,
            Long otherUserId
    ) {

        Users currentUser = userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("Current user not found"));

        Users otherUser = userRepository
                .findById(otherUserId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (currentUser.getId().equals(otherUser.getId())) {
            throw new RuntimeException(
                    "You cannot message yourself"
            );
        }

        Users userOne;
        Users userTwo;

        // Always store users in the same order.
        if (currentUser.getId() < otherUser.getId()) {
            userOne = currentUser;
            userTwo = otherUser;
        } else {
            userOne = otherUser;
            userTwo = currentUser;
        }

        Conversation conversation =
                conversationRepository
                        .findByUserOneAndUserTwo(
                                userOne,
                                userTwo
                        )
                        .orElseGet(() ->
                                conversationRepository.save(
                                        Conversation.builder()
                                                .userOne(userOne)
                                                .userTwo(userTwo)
                                                .build()
                                )
                        );

        return toConversationDto(
                conversation,
                currentUser
        );
    }

    // ==========================================
    // GET CONVERSATIONS
    // ==========================================

    @Transactional(readOnly = true)
    public List<ConversationDto> getConversations(
            String clerkId
    ) {

        Users currentUser = userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("Current user not found"));

        List<Conversation> conversations =
                conversationRepository
                        .findByUserOneOrUserTwoOrderByUpdatedAtDesc(
                                currentUser,
                                currentUser
                        );

        return conversations.stream()
                .map(conversation ->
                        toConversationDto(
                                conversation,
                                currentUser
                        )
                )
                .toList();
    }

    // ==========================================
    // GET MESSAGES
    // ==========================================

    @Transactional(readOnly = true)
    public List<MessageDto> getMessages(
            String clerkId,
            Long conversationId
    ) {

        Users currentUser = userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("Current user not found"));

        Conversation conversation =
                conversationRepository
                        .findById(conversationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Conversation not found"
                                ));

        validateParticipant(
                conversation,
                currentUser
        );

        return messageRepository
                .findByConversationOrderByCreatedAtAsc(
                        conversation
                )
                .stream()
                .map(this::toMessageDto)
                .toList();
    }

    // ==========================================
    // SEND MESSAGE
    // ==========================================

    @Transactional
    public MessageDto sendMessage(
            String clerkId,
            Long conversationId,
            CreateMessageDto dto
    ) {

        Users currentUser = userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("Current user not found"));

        Conversation conversation =
                conversationRepository
                        .findById(conversationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Conversation not found"
                                ));

        validateParticipant(
                conversation,
                currentUser
        );

        if (dto.content() == null ||
                dto.content().isBlank()) {

            throw new IllegalArgumentException(
                    "Message cannot be empty"
            );
        }

        Message message = Message.builder()
                .conversation(conversation)
                .sender(currentUser)
                .content(dto.content().trim())
                .createdAt(LocalDateTime.now())
                .read(false)
                .build();

        Message saved =
                messageRepository.save(message);

        conversation.setUpdatedAt(
                LocalDateTime.now()
        );

        conversationRepository.save(conversation);

        return toMessageDto(saved);
    }

    // ==========================================
    // MARK AS READ
    // ==========================================

    @Transactional
    public void markMessagesAsRead(
            String clerkId,
            Long conversationId
    ) {

        Users currentUser = userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("Current user not found"));

        Conversation conversation =
                conversationRepository
                        .findById(conversationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Conversation not found"
                                ));

        validateParticipant(
                conversation,
                currentUser
        );

        List<Message> messages =
                messageRepository
                        .findByConversationOrderByCreatedAtAsc(
                                conversation
                        );

        for (Message message : messages) {

            if (!message.getSender()
                    .getId()
                    .equals(currentUser.getId())) {

                message.setRead(true);
            }
        }

        messageRepository.saveAll(messages);
    }

    // ==========================================
// GET SINGLE CONVERSATION
// ==========================================

    @Transactional(readOnly = true)
    public ConversationDto getConversation(
            String clerkId,
            Long conversationId
    ) {
        Users currentUser = userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        Conversation conversation =
                conversationRepository
                        .findById(conversationId)
                        .orElseThrow(() -> new RuntimeException("Conversation not found"));
        validateParticipant(
                conversation,
                currentUser
        );
        return toConversationDto(
                conversation,
                currentUser
        );
    }

    // ==========================================
    // SECURITY
    // ==========================================

    private void validateParticipant(
            Conversation conversation,
            Users user
    ) {

        boolean participant =
                conversation.getUserOne()
                        .getId()
                        .equals(user.getId())
                        ||
                        conversation.getUserTwo()
                                .getId()
                                .equals(user.getId());

        if (!participant) {
            throw new RuntimeException(
                    "You are not part of this conversation"
            );
        }
    }

    // ==========================================
    // DTO MAPPING
    // ==========================================

    private MessageDto toMessageDto(
            Message message
    ) {

        Users sender = message.getSender();

        Profile profile = sender.getProfile();

        return new MessageDto(
                message.getId(),
                message.getConversation().getId(),
                sender.getId(),
                profile != null
                        ? profile.getFullName()
                        : sender.getEmail(),
                profile != null
                        ? profile.getUsername()
                        : null,
                profile != null
                        ? profile.getProfileImage()
                        : null,
                message.getContent(),
                message.getCreatedAt(),
                message.getRead()
        );
    }

    private ConversationDto toConversationDto(
            Conversation conversation,
            Users currentUser
    ) {

        Users otherUser =
                conversation.getUserOne()
                        .getId()
                        .equals(currentUser.getId())
                        ? conversation.getUserTwo()
                        : conversation.getUserOne();

        Profile profile = otherUser.getProfile();

        List<Message> messages =
                messageRepository
                        .findByConversationOrderByCreatedAtAsc(
                                conversation
                        );

        Message lastMessage =
                messages.isEmpty()
                        ? null
                        : messages.get(messages.size() - 1);

        long unreadCount = messages.stream()
                .filter(message ->
                        !message.getSender()
                                .getId()
                                .equals(currentUser.getId())
                )
                .filter(message ->
                        !Boolean.TRUE.equals(message.getRead())
                )
                .count();

        return new ConversationDto(
                conversation.getId(),
                otherUser.getId(),
                profile != null
                        ? profile.getFullName()
                        : otherUser.getEmail(),
                profile != null
                        ? profile.getUsername()
                        : null,
                profile != null
                        ? profile.getProfileImage()
                        : null,
                lastMessage != null
                        ? lastMessage.getContent()
                        : null,
                lastMessage != null
                        ? lastMessage.getCreatedAt()
                        : null,
                unreadCount,
                conversation.getUpdatedAt()
        );
    }
}
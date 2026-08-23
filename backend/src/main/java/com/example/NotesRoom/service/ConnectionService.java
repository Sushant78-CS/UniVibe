package com.example.NotesRoom.service;

import com.example.NotesRoom.dto.connection.ConnectedPersonDto;
import com.example.NotesRoom.dto.connection.ConnectionRequestDto;
import com.example.NotesRoom.dto.connection.ConnectionStatus;
import com.example.NotesRoom.dto.connection.CreateConnectionDto;
import com.example.NotesRoom.entity.*;
import com.example.NotesRoom.repository.ConnectionRepository;
import com.example.NotesRoom.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConnectionService {

    private final ConnectionRepository connectionRepository;
    private final UserRepository userRepository;

    public Connection sendRequest(
            String clerkId,
            CreateConnectionDto dto) {
        Users sender = userRepository.findByClerkId(clerkId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
        Users receiver = userRepository.findById(dto.receiverId())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
        if (sender.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException(
                    "You cannot connect with yourself"
            );
        }
        var existing = connectionRepository
                .findConnectionBetweenUsers(
                        sender.getId(),
                        receiver.getId()
                );
        if (existing.isPresent()) {
            Connection connection = existing.get();
            if (connection.getStatus() == ConnectionStatus.ACCEPTED) {
                throw new IllegalArgumentException(
                        "You are already connected");
            }
            if (connection.getStatus()
                    == ConnectionStatus.PENDING) {
                if (connection.getSender()
                        .getId()
                        .equals(sender.getId())) {
                    throw new IllegalArgumentException(
                            "Connection request already sent");
                }
                throw new IllegalArgumentException(
                        "This user has already sent you a request");
            }
        }
        Connection connection = Connection.builder()
                .sender(sender)
                .receiver(receiver)
                .status(ConnectionStatus.PENDING)
                .build();
        return connectionRepository.save(connection);
    }

    public List<ConnectionRequestDto> getRequests(
            String clerkId
    ) {
        return connectionRepository
                .findByReceiver_ClerkIdAndStatus(
                        clerkId,
                        ConnectionStatus.PENDING
                )
                .stream()
                .map(connection -> {

                    Profile profile =
                            connection.getSender()
                                    .getProfile();

                    return new ConnectionRequestDto(
                            connection.getId(),
                            profile.getId(),
                            profile.getFullName(),
                            profile.getUsername(),
                            profile.getProfileImage(),
                            connection.getStatus()
                    );
                })
                .toList();
    }

    public void updateRequest(
            String clerkId,
            Long connectionId,
            String action
    ) {

        Connection connection =
                connectionRepository.findById(connectionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Connection request not found"
                                )
                        );

        // Only the receiver can accept/reject
        if (!connection
                .getReceiver()
                .getClerkId()
                .equals(clerkId)) {

            throw new RuntimeException(
                    "You cannot modify this request"
            );
        }

        if (connection.getStatus() != ConnectionStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Request has already been handled"
            );
        }

        if ("ACCEPT".equalsIgnoreCase(action)) {

            connection.setStatus(
                    ConnectionStatus.ACCEPTED
            );

        } else if ("REJECT".equalsIgnoreCase(action)) {

            connection.setStatus(
                    ConnectionStatus.REJECTED
            );

        } else {

            throw new IllegalArgumentException(
                    "Invalid connection action"
            );
        }

        connection.setUpdatedAt(LocalDateTime.now());

        connectionRepository.save(connection);
    }

    public String getConnectionStatus(
            String clerkId,
            Long otherUserId) {
        Users currentUser = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return connectionRepository
                .findConnectionBetweenUsers(
                        currentUser.getId(),
                        otherUserId
                )
                .map(connection -> {
                    if (connection.getStatus()
                            == ConnectionStatus.ACCEPTED) {
                        return "CONNECTED";
                    }
                    if (connection.getSender()
                            .getId()
                            .equals(currentUser.getId())) {
                        return "PENDING_SENT";
                    }
                    return "PENDING_RECEIVED";
                })
                .orElse("NONE");
    }

    public List<ConnectedPersonDto> getConnections(String clerkId) {
        Users currentUser = userRepository
                .findByClerkId(clerkId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Connection> connections =
                connectionRepository.findAcceptedConnections(
                        currentUser.getId(), ConnectionStatus.ACCEPTED
                );
        return connections.stream()
                .map(connection -> {
                    // Find the OTHER user
                    Users otherUser;
                    if (connection.getSender().getId()
                            .equals(currentUser.getId())) {
                        otherUser = connection.getReceiver();
                    } else {
                        otherUser = connection.getSender();
                    }
                    Profile profile = otherUser.getProfile();
                    return new ConnectedPersonDto(
                            connection.getId(),
                            profile.getId(),
                            profile.getFullName(),
                            profile.getUsername(),
                            profile.getProfileImage());
                }).toList();
    }
}
package com.example.NotesRoom.repository;

import com.example.NotesRoom.dto.connection.ConnectionStatus;
import com.example.NotesRoom.entity.Connection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConnectionRepository
        extends JpaRepository<Connection, Long> {

    Optional<Connection> findBySender_ClerkIdAndReceiver_Id(
            String clerkId,
            Long receiverId
    );

    Optional<Connection> findBySender_IdAndReceiver_ClerkId(
            Long senderId,
            String clerkId
    );

    boolean existsBySender_ClerkIdAndReceiver_Id(
            String clerkId,
            Long receiverId
    );

    Optional<Connection> findBySender_IdAndReceiver_Id(
            Long senderId,
            Long receiverId
    );

    List<Connection> findByReceiver_ClerkIdAndStatus(
            String clerkId,
            ConnectionStatus status
    );

    List<Connection> findBySender_ClerkIdAndStatus(
            String clerkId,
            ConnectionStatus status
    );


    // ==========================================
    // FIND CONNECTION BETWEEN TWO USERS
    // ==========================================

    @Query("""
            SELECT c
            FROM Connection c
            WHERE
                (c.sender.id = :userId
                 AND c.receiver.id = :otherUserId)
                OR
                (c.sender.id = :otherUserId
                 AND c.receiver.id = :userId)
            """)
    Optional<Connection> findConnectionBetweenUsers(
            @Param("userId") Long userId,
            @Param("otherUserId") Long otherUserId
    );


    // ==========================================
    // PAGINATED ACCEPTED CONNECTIONS
    // ==========================================

    @EntityGraph(
            attributePaths = {
                    "sender",
                    "receiver",
                    "sender.profile",
                    "receiver.profile"
            }
    )
    @Query(
            value = """
                    SELECT c
                    FROM Connection c
                    WHERE c.status = :status
                    AND (
                        c.sender.id = :userId
                        OR c.receiver.id = :userId
                    )
                    ORDER BY c.updatedAt DESC, c.id DESC
                    """,
            countQuery = """
                    SELECT COUNT(c)
                    FROM Connection c
                    WHERE c.status = :status
                    AND (
                        c.sender.id = :userId
                        OR c.receiver.id = :userId
                    )
                    """
    )
    Page<Connection> findAcceptedConnections(
            @Param("userId") Long userId,
            @Param("status") ConnectionStatus status,
            Pageable pageable
    );


    // ==========================================
    // COUNT CONNECTIONS
    // ==========================================

    @Query("""
            SELECT COUNT(c)
            FROM Connection c
            WHERE c.status = :status
            AND (
                c.sender.id = :userId
                OR c.receiver.id = :userId
            )
            """)
    long countConnectionsByStatus(
            @Param("userId") Long userId,
            @Param("status") ConnectionStatus status
    );
}
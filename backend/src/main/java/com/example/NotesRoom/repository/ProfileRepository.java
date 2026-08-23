package com.example.NotesRoom.repository;

import com.example.NotesRoom.entity.Profile;
import com.example.NotesRoom.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {
    Optional<Profile> findByUser(Users user);

    Optional<Profile> findByUser_ClerkId(String clerkId);

    Optional<Profile> findByUser_Id(Long userId);

    boolean existsByUser_Id(Long userId);

    boolean existsByUser_ClerkId(String clerkId);

    @Query("""
                SELECT p
                FROM Profile p
                JOIN p.user u
                WHERE u.clerkId <> :clerkId
                AND p.profileCompleted = true
            
                AND (
                    :query = ''
                    OR LOWER(p.fullName) LIKE LOWER(CONCAT('%', :query, '%'))
                    OR LOWER(p.username) LIKE LOWER(CONCAT('%', :query, '%'))
                    OR LOWER(p.college) LIKE LOWER(CONCAT('%', :query, '%'))
                    OR LOWER(p.department) LIKE LOWER(CONCAT('%', :query, '%'))
                    OR LOWER(p.interests) LIKE LOWER(CONCAT('%', :query, '%'))
                )
            
                AND (
                    :college = ''
                    OR LOWER(p.college) = LOWER(:college)
                )
            
                AND (
                    :department = ''
                    OR LOWER(p.department) = LOWER(:department)
                )
            
                AND (
                    :year = ''
                    OR p.year = :year
                )
            
                ORDER BY p.fullName ASC
            """)
    List<Profile> discoverPeople(
            @Param("clerkId") String clerkId,
            @Param("query") String query,
            @Param("college") String college,
            @Param("department") String department,
            @Param("year") String year
    );

    Optional<Profile> findByIdAndProfileCompletedTrue(Long id);
}

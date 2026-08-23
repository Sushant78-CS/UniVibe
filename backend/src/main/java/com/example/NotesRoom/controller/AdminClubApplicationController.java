package com.example.NotesRoom.controller;
import com.example.NotesRoom.dto.club.ClubApplicationActionDto;
import com.example.NotesRoom.dto.club.ClubApplicationDto;
import com.example.NotesRoom.service.ClubApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/admin/clubs")
@RequiredArgsConstructor
public class AdminClubApplicationController {
    private final ClubApplicationService clubApplicationService;

    /**
     * Get pending applications for a club.
     */
    @GetMapping("/{clubId}/applications")
    public ResponseEntity<List<ClubApplicationDto>> getApplications(
            @PathVariable Long clubId) {
        return ResponseEntity.ok(
                clubApplicationService
                        .getPendingApplications(clubId)
        );
    }

    /**
     * Accept or reject an application.
     */
    @PutMapping("/applications/{applicationId}")
    public ResponseEntity<ClubApplicationDto> updateApplication(
            @PathVariable Long applicationId,
            @RequestBody ClubApplicationActionDto dto) {
        return ResponseEntity.ok(
                clubApplicationService.updateApplication(
                        applicationId,
                        dto
                )
        );
    }
}
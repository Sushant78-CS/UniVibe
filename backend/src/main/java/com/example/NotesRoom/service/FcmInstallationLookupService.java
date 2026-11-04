package com.example.NotesRoom.service;

import com.example.NotesRoom.entity.FcmInstallation;
import com.example.NotesRoom.entity.Users;
import com.example.NotesRoom.repository.FcmInstallationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FcmInstallationLookupService {

    private final FcmInstallationRepository repository;

    public record InstallationData(
            Long installationId,
            Long userId,
            String token
    ) {}

    @Transactional(readOnly = true)
    public List<InstallationData> findForUsers(
            List<Users> users
    ) {

        if (users == null || users.isEmpty()) {
            return List.of();
        }

        return repository.findAllByUserIn(users)
                .stream()
                .map(installation ->
                        new InstallationData(
                                installation.getId(),
                                installation.getUser().getId(),
                                installation.getToken()
                        )
                )
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InstallationData> findForUser(
            Users user
    ) {

        return repository.findAllByUser(user)
                .stream()
                .map(installation ->
                        new InstallationData(
                                installation.getId(),
                                installation.getUser().getId(),
                                installation.getToken()
                        )
                )
                .toList();
    }
}

package com.example.NotesRoom.service;

import com.example.NotesRoom.entity.FcmInstallation;
import com.example.NotesRoom.entity.Users;
import com.example.NotesRoom.repository.FcmInstallationRepository;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FcmService {

    private final FcmInstallationRepository fcmInstallationRepository;

    // =========================================================
    // EXISTING SINGLE USER METHOD
    // =========================================================

    @Transactional(readOnly = true)
    public void sendToUser(
            Users user,
            String title,
            String body,
            String url
    ) {
        List<FcmInstallation> installations =
                fcmInstallationRepository.findAllByUser(user);

        if (installations.isEmpty()) {
            log.info(
                    "No FCM installations found for userId={}",
                    user.getId()
            );
            return;
        }

        for (FcmInstallation installation : installations) {
            sendToInstallation(
                    installation,
                    title,
                    body,
                    url
            );
        }
    }

    // =========================================================
    // BATCH VIBE NOTIFICATIONS
    // =========================================================

    @Async
    @Transactional(readOnly = true)
    public void sendToUsers(
            List<Users> users,
            String title,
            String body,
            String url
    ) {

        if (users == null || users.isEmpty()) {
            return;
        }

        try {

            List<FcmInstallation> installations =
                    fcmInstallationRepository
                            .findAllByUserIn(users);

            if (installations.isEmpty()) {
                log.info(
                        "No FCM installations found for {} users",
                        users.size()
                );
                return;
            }

            log.info(
                    "Sending Vibe FCM notification to {} installations",
                    installations.size()
            );

            for (FcmInstallation installation :
                    installations) {

                sendToInstallation(
                        installation,
                        title,
                        body,
                        url
                );
            }

        } catch (Exception e) {

            log.error(
                    "Failed to send batch FCM notifications",
                    e
            );
        }
    }

    // =========================================================
    // ACTUAL FCM SEND
    // =========================================================

    private void sendToInstallation(
            FcmInstallation installation,
            String title,
            String body,
            String url
    ) {

        try {

            Message message =
                    Message.builder()
                            .setFid(
                                    installation.getFid()
                            )
                            .putData(
                                    "title",
                                    title
                            )
                            .putData(
                                    "body",
                                    body
                            )
                            .putData(
                                    "url",
                                    url
                            )
                            .build();

            String response =
                    FirebaseMessaging
                            .getInstance()
                            .send(message);

            log.info(
                    "FCM push sent successfully. userId={}, fid={}, response={}",
                    installation.getUser().getId(),
                    installation.getFid(),
                    response
            );

        } catch (Exception e) {

            log.error(
                    "Failed to send FCM push. userId={}, fid={}",
                    installation.getUser().getId(),
                    installation.getFid(),
                    e
            );
        }
    }
}
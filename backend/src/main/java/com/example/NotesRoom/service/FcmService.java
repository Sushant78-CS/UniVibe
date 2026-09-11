package com.example.NotesRoom.service;

import com.example.NotesRoom.config.FirebaseConfig;
import com.example.NotesRoom.entity.FcmInstallation;
import com.example.NotesRoom.entity.Users;
import com.example.NotesRoom.repository.FcmInstallationRepository;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.MessagingErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FcmService {

    private final FcmInstallationRepository fcmInstallationRepository;
//    private final FirebaseConfig firebaseConfig;
    private final FirebaseMessaging firebaseMessaging;

    // =========================================================
    // SEND TO SINGLE USER
    // =========================================================

    @Transactional
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
    // SEND TO MULTIPLE USERS
    // =========================================================

    @Async
    @Transactional
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
                    "Sending FCM notification to {} installations",
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

        String token = installation.getToken();

        if (token == null || token.isBlank()) {

            log.warn(
                    "Skipping FCM installation with empty token. installationId={}",
                    installation.getId()
            );

            return;
        }
        try {

            Message message =
                    Message.builder()
                            .setToken(token)
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
                    firebaseMessaging.send(message);

            log.info(
                    "FCM push sent successfully. userId={}, response={}",
                    installation.getUser().getId(),
                    response
            );

        } catch (FirebaseMessagingException e) {

            MessagingErrorCode errorCode =
                    e.getMessagingErrorCode();

            log.error(
                    "FCM send failed. userId={}, errorCode={}",
                    installation.getUser().getId(),
                    errorCode,
                    e
            );

            if (
                    errorCode == MessagingErrorCode.UNREGISTERED ||
                            errorCode == MessagingErrorCode.INVALID_ARGUMENT
            ) {

                try {

                    fcmInstallationRepository
                            .deleteByToken(token);

                    log.info(
                            "Removed invalid FCM token from database. userId={}",
                            installation.getUser().getId()
                    );

                } catch (Exception deleteError) {

                    log.error(
                            "Failed to remove invalid FCM token from database.",
                            deleteError
                    );
                }
            }

        } catch (Exception e) {

            log.error(
                    "Unexpected error while sending FCM notification. userId={}",
                    installation.getUser().getId(),
                    e
            );
        }}


}
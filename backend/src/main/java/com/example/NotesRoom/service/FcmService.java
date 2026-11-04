
package com.example.NotesRoom.service;

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

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FcmService {

    private final FcmInstallationRepository fcmInstallationRepository;
    private final FcmInstallationLookupService installationLookupService;
    private final FirebaseMessaging firebaseMessaging;

    // =========================================================
    // SEND TO SINGLE USER
    // =========================================================

    public void sendToUser(
            Users user,
            String title,
            String body,
            String url
    ) {

        List<FcmInstallationLookupService.InstallationData>
                installations =
                installationLookupService.findForUser(user);

        if (installations.isEmpty()) {
            return;
        }

        for (var installation : installations) {
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

            List<FcmInstallationLookupService.InstallationData>
                    installations =
                    installationLookupService.findForUsers(users);

            if (installations.isEmpty()) {
                return;
            }

            log.info(
                    "Sending FCM notifications to {} installations",
                    installations.size()
            );

            for (var installation : installations) {
                sendToInstallation(
                        installation,
                        title,
                        body,
                        url
                );
            }

        } catch (Exception e) {
            log.error("Failed to send FCM notifications", e);
        }
    }

    // =========================================================
    // ACTUAL FCM SEND
    // =========================================================

    private void sendToInstallation(
            FcmInstallationLookupService.InstallationData installation,
            String title,
            String body,
            String url
    ) {

        String token = installation.token();

        if (token == null || token.isBlank()) {
            return;
        }

        try {

            Message message = Message.builder()
                    .setToken(token)
                    .putData("title", title)
                    .putData("body", body)
                    .putData("url", url)
                    .build();

            firebaseMessaging.send(message);

        } catch (FirebaseMessagingException e) {

            MessagingErrorCode errorCode =
                    e.getMessagingErrorCode();

            log.error(
                    "FCM failed. userId={}, errorCode={}",
                    installation.userId(),
                    errorCode
            );

            if (
                    errorCode == MessagingErrorCode.UNREGISTERED ||
                            errorCode == MessagingErrorCode.INVALID_ARGUMENT
            ) {

                try {
                    fcmInstallationRepository.deleteByToken(token);
                } catch (Exception deleteError) {
                    log.error(
                            "Failed to delete invalid FCM token",
                            deleteError
                    );
                }
            }

        } catch (Exception e) {

            log.error(
                    "Unexpected FCM error. userId={}",
                    installation.userId(),
                    e
            );
        }
    }
}

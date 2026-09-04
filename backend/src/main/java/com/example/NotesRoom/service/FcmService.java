package com.example.NotesRoom.service;

import com.example.NotesRoom.entity.FcmInstallation;
import com.example.NotesRoom.entity.Users;
import com.example.NotesRoom.repository.FcmInstallationRepository;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FcmService {

    private final FcmInstallationRepository fcmInstallationRepository;

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
            try {
                Message message = Message.builder()
                        .setFid(installation.getFid())
                        .putData("title", title)
                        .putData("body", body)
                        .putData("url", url)
                        .build();

                String response =
                        FirebaseMessaging.getInstance().send(message);

                log.info(
                        "FCM push sent successfully. userId={}, fid={}, response={}",
                        user.getId(),
                        installation.getFid(),
                        response
                );

            } catch (Exception e) {
                log.error(
                        "Failed to send FCM push. userId={}, fid={}",
                        user.getId(),
                        installation.getFid(),
                        e
                );
            }
        }
    }
}
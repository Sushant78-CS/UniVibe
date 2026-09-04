package com.example.NotesRoom.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
@Slf4j
public class FirebaseConfig {

    @PostConstruct
    public void initializeFirebase() {

        log.info("========== FirebaseConfig loaded ==========");

        try {

            if (!FirebaseApp.getApps().isEmpty()) {
                log.info("Firebase Admin SDK is already initialized.");
                return;
            }

            String credentialsPath =
                    System.getenv("GOOGLE_APPLICATION_CREDENTIALS");

            InputStream serviceAccount;

            if (credentialsPath != null
                    && !credentialsPath.isBlank()) {

                log.info(
                        "Using credentials from GOOGLE_APPLICATION_CREDENTIALS"
                );

                serviceAccount =
                        new FileInputStream(credentialsPath);

            } else {

                log.info(
                        "Using local credentials: firebase/service-account.json"
                );

                serviceAccount =
                        new FileInputStream(
                                "firebase/service-account.json"
                        );
            }

            GoogleCredentials credentials =
                    GoogleCredentials.fromStream(
                            serviceAccount
                    );

            FirebaseOptions options =
                    FirebaseOptions.builder()
                            .setCredentials(credentials)
                            .setProjectId("univibe-b70bc")
                            .build();

            FirebaseApp.initializeApp(options);

            serviceAccount.close();

            log.info(
                    "========== Firebase Admin SDK initialized successfully =========="
            );

        } catch (IOException e) {

            log.error(
                    "Firebase Admin SDK initialization failed",
                    e
            );

            throw new RuntimeException(
                    "Firebase initialization failed",
                    e
            );
        }
    }
}
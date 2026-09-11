package com.example.NotesRoom.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Bean
    public FirebaseApp firebaseApp() {

        if (!FirebaseApp.getApps().isEmpty()) {
            System.out.println(
                    "Firebase Admin SDK already initialized"
            );

            return FirebaseApp.getInstance();
        }

        String renderPath =
                "/etc/secrets/service-account.json";

        String localPath =
                "firebase/service-account.json";

        try (InputStream serviceAccount =
                     openCredentials(renderPath, localPath)) {

            FirebaseOptions options =
                    FirebaseOptions.builder()
                            .setCredentials(
                                    GoogleCredentials.fromStream(
                                            serviceAccount
                                    )
                            )
                            .setProjectId("univibe-b70bc")
                            .build();

            FirebaseApp app =
                    FirebaseApp.initializeApp(options);

            System.out.println(
                    "Firebase Admin SDK initialized successfully"
            );

            return app;

        } catch (Exception e) {

            System.err.println(
                    "Firebase initialization failed: "
                            + e.getMessage()
            );

            throw new RuntimeException(
                    "Firebase initialization failed",
                    e
            );
        }
    }

    @Bean
    public FirebaseMessaging firebaseMessaging(
            FirebaseApp firebaseApp
    ) {

        System.out.println(
                "Firebase Messaging bean created"
        );

        return FirebaseMessaging.getInstance(firebaseApp);
    }

    private InputStream openCredentials(
            String renderPath,
            String localPath
    ) throws Exception {

        try {

            InputStream inputStream =
                    new FileInputStream(renderPath);

            System.out.println(
                    "Using Render Firebase credentials: "
                            + renderPath
            );

            return inputStream;

        } catch (Exception ignored) {

            InputStream inputStream =
                    new FileInputStream(localPath);

            System.out.println(
                    "Using local Firebase credentials: "
                            + localPath
            );

            return inputStream;
        }
    }
}
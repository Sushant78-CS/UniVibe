package com.example.NotesRoom.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initializeFirebase() {

        try {
            if (!FirebaseApp.getApps().isEmpty()) {
                return;
            }

            InputStream serviceAccount;

            // Render Secret File
            String renderPath =
                    "/etc/secrets/service-account.json";

            // Local development file
            String localPath =
                    "firebase/service-account.json";

            try {
                serviceAccount =
                        new FileInputStream(renderPath);

                System.out.println(
                        "Using Render Firebase credentials: "
                                + renderPath
                );

            } catch (Exception renderException) {

                serviceAccount =
                        new FileInputStream(localPath);

                System.out.println(
                        "Using local Firebase credentials: "
                                + localPath
                );
            }

            FirebaseOptions options =
                    FirebaseOptions.builder()
                            .setCredentials(
                                    GoogleCredentials
                                            .fromStream(serviceAccount)
                            )
                            .setProjectId("univibe-b70bc")
                            .build();

            FirebaseApp.initializeApp(options);

            serviceAccount.close();

            System.out.println(
                    "Firebase Admin SDK initialized successfully"
            );

        } catch (Exception e) {

            System.err.println(
                    "Firebase initialization failed"
            );

            throw new RuntimeException(
                    "Firebase initialization failed",
                    e
            );
        }
    }
}
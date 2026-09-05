package com.example.NotesRoom;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class NotesRoomApplication {

    public static void main(String[] args) {
        SpringApplication.run(NotesRoomApplication.class, args);
    }

}

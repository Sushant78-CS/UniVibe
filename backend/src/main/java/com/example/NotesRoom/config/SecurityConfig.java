package com.example.NotesRoom.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http.csrf(csrf -> csrf.disable())
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/public/**").permitAll()
                                                .anyRequest()
                                                .authenticated())
                                .oauth2ResourceServer(oauth -> oauth.jwt(
                                                Customizer.withDefaults()))
                                .cors(cors -> cors.configurationSource(request -> {
                                        CorsConfiguration config = new CorsConfiguration();
                                        config.setAllowedOrigins(List.of(
                                                        "https://univibe-fn6n.onrender.com",
                                                        "http://localhost:5173"));

                                        config.setAllowedMethods(List.of(
                                                        "GET",
                                                        "POST",
                                                        "PUT",
                                                        "DELETE",
                                                        "OPTIONS"));

                                        config.setAllowedHeaders(List.of("*"));

                                        config.setAllowCredentials(true);

                                        return config;
                                }));

                return http.build();
        }

}

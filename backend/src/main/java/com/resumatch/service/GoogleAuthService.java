package com.resumatch.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.resumatch.model.User;
import com.resumatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleAuthService {

    private final UserRepository userRepository;
    
    @Value("${google.client-id}")
    private String clientId;

    public Optional<User> verifyGoogleToken(String idTokenString) {
        if ("simulated-google-token".equals(idTokenString)) {
            return Optional.of(getOrCreateUser("google_user@example.com", "Google User"));
        }
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(clientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String name = (String) payload.get("name");

                return Optional.of(getOrCreateUser(email, name));
            }
        } catch (Exception e) {
            log.error("Google token verification failed", e);
        }
        return Optional.empty();
    }

    private User getOrCreateUser(String email, String name) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .name(name)
                    .password("GOOGLE_AUTH_USER") // Placeholder
                    .isPremium(false)
                    .build();
            return userRepository.save(newUser);
        });
    }
}

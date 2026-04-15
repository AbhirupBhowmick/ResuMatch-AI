package com.resumatch.service;

import com.resumatch.model.User;
import com.resumatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public void resetMonthlyUsage() {
        userRepository.resetMonthlyUsage();
    }

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public void incrementAuditCount(User user) {
        user.setMonthlyAuditCount(user.getMonthlyAuditCount() + 1);
        userRepository.save(user);
    }

    public void incrementMcqCount(User user) {
        user.setMonthlyMcqCount(user.getMonthlyMcqCount() + 1);
        userRepository.save(user);
    }

    @Transactional
    public String rotateApiKey(User user) {
        String newKey = "rm_" + java.util.UUID.randomUUID().toString().replace("-", "");
        user.setApiKey(newKey);
        userRepository.save(user);
        return newKey;
    }

    public Optional<User> getUserByApiKey(String apiKey) {
        return userRepository.findByApiKey(apiKey);
    }
}

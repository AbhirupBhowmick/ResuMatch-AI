package com.resumatch.controller;

import com.resumatch.security.JwtUtils;
import com.resumatch.service.GoogleAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth/google")
@RequiredArgsConstructor
public class GoogleAuthController {

    private final GoogleAuthService googleAuthService;
    private final JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> loginWithGoogle(@RequestBody Map<String, String> payload) {
        String idToken = payload.get("idToken");
        
        return googleAuthService.verifyGoogleToken(idToken)
                .<ResponseEntity<?>>map(user -> {
                    // Create UserDetailsImpl for JWT generation
                    com.resumatch.security.UserDetailsImpl userDetails = com.resumatch.security.UserDetailsImpl.build(user);
                    Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    String jwt = jwtUtils.generateJwtToken(authentication);
                    
                    return ResponseEntity.ok(new AuthController.JwtResponse(jwt, "Bearer", user.getEmail(), user.getName(), user.getSubscriptionTier().toString()));
                })
                .orElse(ResponseEntity.badRequest().body("Invalid Google Token"));
    }
}

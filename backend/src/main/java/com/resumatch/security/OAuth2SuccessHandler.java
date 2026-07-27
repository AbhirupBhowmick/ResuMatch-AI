package com.resumatch.security;

import com.resumatch.model.User;
import com.resumatch.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    @Value("${app.frontend-url:https://resu-match-ai-eight.vercel.app}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        
        User user = userRepository.findByEmail(email).orElseThrow();
        String token = jwtUtils.generateJwtToken(authentication);

        String baseUrl = resolveFrontendUrl(request).replaceAll("/$", "");

        String targetUrl = UriComponentsBuilder.fromUriString(baseUrl + "/dashboard")
                .queryParam("token", token)
                .queryParam("email", user.getEmail())
                .queryParam("name", user.getName())
                .queryParam("tier", user.getSubscriptionTier().toString())
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private String resolveFrontendUrl(HttpServletRequest request) {
        String origin = request.getHeader("Origin");
        if (origin != null && !origin.isBlank() && !isGoogleDomain(origin)) {
            return origin;
        }
        String referer = request.getHeader("Referer");
        if (referer != null && !referer.isBlank() && !isGoogleDomain(referer)) {
            try {
                java.net.URI uri = new java.net.URI(referer);
                String schemeHost = uri.getScheme() + "://" + uri.getAuthority();
                if (!isGoogleDomain(schemeHost)) {
                    return schemeHost;
                }
            } catch (Exception ignored) {}
        }
        return frontendUrl;
    }

    private boolean isGoogleDomain(String url) {
        if (url == null) return false;
        String lower = url.toLowerCase();
        return lower.contains("google.com") || lower.contains("googleusercontent.com") || lower.contains("onrender.com");
    }
}

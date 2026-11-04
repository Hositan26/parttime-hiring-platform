package tanhs.fudn.parttime_hiring_plaform_project.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;

import java.io.IOException;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final tanhs.fudn.parttime_hiring_plaform_project.service.auth.AuthSessionService sessions;
    private final UserRepository userRepository;

    @Value("${app.oauth2.redirectUri:http://localhost:5173/oauth2/redirect}")
    private String redirectUri;

    public OAuth2AuthenticationSuccessHandler(tanhs.fudn.parttime_hiring_plaform_project.service.auth.AuthSessionService sessions, UserRepository userRepository) {
        this.sessions = sessions;
        this.userRepository = userRepository;
    }

    // Issues the local account cookie after verified Google authentication.
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String username = oAuth2User.getAttribute("localUsername");

        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found after OAuth2 login"));

        sessions.start(user, response);

        if (request.getSession(false) != null) request.getSession(false).invalidate();
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}



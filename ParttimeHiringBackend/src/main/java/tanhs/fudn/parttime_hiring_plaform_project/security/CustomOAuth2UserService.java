package tanhs.fudn.parttime_hiring_plaform_project.security;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.Role;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.UserOauthAccount;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RoleRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserOauthAccountRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final UserRepository userRepository;
    private final UserOauthAccountRepository accountRepository;
    private final RoleRepository roleRepository;

    // Resolves verified Google identity into a local account principal.
    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) {
        OAuth2User remote = super.loadUser(request);
        User local = resolveUser(remote.getAttributes());
        Map<String, Object> attributes = new HashMap<>(remote.getAttributes());
        attributes.put("localUsername", local.getUsername());
        return new DefaultOAuth2User(remote.getAuthorities(), attributes, "localUsername");
    }

    // Rejects unverified identities and disabled or unlinked existing accounts.
    public User resolveUser(Map<String, Object> attributes) {
        String subject = (String) attributes.get("sub");
        String email = (String) attributes.get("email");
        if (subject == null || email == null || !Boolean.TRUE.equals(attributes.get("email_verified"))) {
            throw new OAuth2AuthenticationException("Verified Google email is required");
        }
        var account = accountRepository.findByProviderAndProviderAccountId("google", subject);
        if (account.isPresent()) {
            User user = account.get().getUser();
            if (!Boolean.TRUE.equals(user.getIsActive())) {
                throw new OAuth2AuthenticationException("Account is unavailable");
            }
            return user;
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new OAuth2AuthenticationException("Sign in with your existing account");
        }
        return createAccount(attributes, subject, email);
    }

    // Creates a Google-only account with default user permissions.
    private User createAccount(Map<String, Object> attributes, String subject, String email) {
        Role role = roleRepository.findById("USER")
                .orElseThrow(() -> new OAuth2AuthenticationException("Default role is unavailable"));
        User user = new User();
        user.setUsername("google_" + java.util.UUID.randomUUID().toString().replace("-", ""));
        user.setEmail(email);
        user.setDisplayName((String) attributes.getOrDefault("name", "Google User"));
        user.setAvatarUrl((String) attributes.get("picture"));
        user.setRoles(Collections.singleton(role));
        user = userRepository.save(user);
        UserOauthAccount account = new UserOauthAccount();
        account.setUser(user);
        account.setProvider("google");
        account.setProviderAccountId(subject);
        accountRepository.save(account);
        return user;
    }
}

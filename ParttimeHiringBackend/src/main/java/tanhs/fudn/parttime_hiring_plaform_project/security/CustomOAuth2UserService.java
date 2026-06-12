package tanhs.fudn.parttime_hiring_plaform_project.security;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.Role;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.UserOauthAccount;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RoleRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserOauthAccountRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final UserOauthAccountRepository userOauthAccountRepository;
    private final RoleRepository roleRepository;

    public CustomOAuth2UserService(UserRepository userRepository,
                                   UserOauthAccountRepository userOauthAccountRepository,
                                   RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.userOauthAccountRepository = userOauthAccountRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId();
        String providerAccountId = oAuth2User.getAttribute("sub"); // Dành cho Google
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        if (providerAccountId == null) {
            throw new OAuth2AuthenticationException("Provider account ID not found from OAuth2 provider");
        }

        // Kiểm tra xem tài khoản OAuth2 này đã liên kết chưa
        Optional<UserOauthAccount> oauthAccountOpt = userOauthAccountRepository
                .findByProviderAndProviderAccountId(provider, providerAccountId);

        User user;

        if (oauthAccountOpt.isPresent()) {
            // Đã liên kết -> Lấy User
            user = oauthAccountOpt.get().getUser();
        } else {
            // Chưa liên kết -> Kiểm tra xem email đã tồn tại trong bảng User chưa
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                user = userOpt.get();
            } else {
                // Tạo mới User
                Role userRole = roleRepository.findById("USER")
                        .orElseGet(() -> roleRepository.save(new Role("USER", "Default User Role")));

                String finalUsername = email.contains("@") ? email.split("@")[0] : email;
                
                user = User.builder()
                        .username(finalUsername)
                        .password(null)
                        .displayName(name != null ? name : "Người dùng Google")
                        .email(email)
                        .avatarUrl(picture)
                        .roles(Collections.singleton(userRole))
                        .build();
                user = userRepository.save(user);
            }

            // Tạo liên kết OAuth2
            UserOauthAccount newOauthAccount = UserOauthAccount.builder()
                    .user(user)
                    .provider(provider)
                    .providerAccountId(providerAccountId)
                    .build();
            userOauthAccountRepository.save(newOauthAccount);
        }

        return oAuth2User; // Có thể map sang CustomOAuth2User nếu cần
    }
}

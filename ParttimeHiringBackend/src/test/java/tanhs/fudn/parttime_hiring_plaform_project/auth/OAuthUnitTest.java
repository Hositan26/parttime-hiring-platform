package tanhs.fudn.parttime_hiring_plaform_project.auth;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.UserOauthAccount;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RoleRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserOauthAccountRepository;
import tanhs.fudn.parttime_hiring_plaform_project.security.CustomOAuth2UserService;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OAuthUnitTest {
    // Rejects unverified email claims before accessing account storage.
    @Test
    void rejectsUnverifiedIdentity() {
        var users = mock(UserRepository.class);
        var accounts = mock(UserOauthAccountRepository.class);
        var service = new CustomOAuth2UserService(users, accounts, mock(RoleRepository.class), mock(tanhs.fudn.parttime_hiring_plaform_project.mapper.AuthMapper.class));
        assertThrows(OAuth2AuthenticationException.class,
                () -> service.resolveUser(Map.of("sub", "123", "email", "u@example.com", "email_verified", false)));
        verifyNoInteractions(users, accounts);
    }

    // Prevents disabled Google accounts from obtaining a new session.
    @Test
    void rejectsDisabledAccount() {
        var accounts = mock(UserOauthAccountRepository.class);
        var account = new UserOauthAccount();
        account.setUser(User.builder().isActive(false).build());
        when(accounts.findByProviderAndProviderAccountId("google", "123")).thenReturn(Optional.of(account));
        var service = new CustomOAuth2UserService(mock(UserRepository.class), accounts, mock(RoleRepository.class), mock(tanhs.fudn.parttime_hiring_plaform_project.mapper.AuthMapper.class));
        assertThrows(OAuth2AuthenticationException.class,
                () -> service.resolveUser(Map.of("sub", "123", "email", "u@example.com", "email_verified", true)));
    }
    // Reuses an existing verified provider link without creating a duplicate account.
    @Test
    void reusesLinkedActiveAccount() {
        var accounts = mock(UserOauthAccountRepository.class);
        var user = User.builder().id(7L).username("google_user").build();
        var account = new UserOauthAccount();
        account.setUser(user);
        when(accounts.findByProviderAndProviderAccountId("google", "123")).thenReturn(Optional.of(account));
        var service = new CustomOAuth2UserService(mock(UserRepository.class), accounts,
                mock(RoleRepository.class), mock(tanhs.fudn.parttime_hiring_plaform_project.mapper.AuthMapper.class));
        assertSame(user, service.resolveUser(Map.of("sub", "123", "email", "u@example.com", "email_verified", true)));
        verify(accounts, never()).save(org.mockito.ArgumentMatchers.any());
    }}

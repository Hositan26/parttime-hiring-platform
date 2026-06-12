package tanhs.fudn.parttime_hiring_plaform_project.repository.identity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.UserOauthAccount;

import java.util.Optional;

@Repository
public interface UserOauthAccountRepository extends JpaRepository<UserOauthAccount, Long> {
    Optional<UserOauthAccount> findByProviderAndProviderAccountId(String provider, String providerAccountId);
}

package tanhs.fudn.parttime_hiring_plaform_project.repository.identity;
import org.springframework.data.jpa.repository.JpaRepository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.RevokedAccessToken;

public interface RevokedAccessTokenRepository extends JpaRepository<RevokedAccessToken, String> {
}

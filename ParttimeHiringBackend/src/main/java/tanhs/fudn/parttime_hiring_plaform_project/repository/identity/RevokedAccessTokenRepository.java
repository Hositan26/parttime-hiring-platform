package tanhs.fudn.parttime_hiring_plaform_project.repository.identity;
import org.springframework.data.jpa.repository.JpaRepository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.RevokedAccessToken;

public interface RevokedAccessTokenRepository extends JpaRepository<RevokedAccessToken, String> {
    // Deletes expired credentials without loading bearer data into memory.
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("delete from RevokedAccessToken value where value.expiresAt < :now")
    void deleteExpired(@org.springframework.data.repository.query.Param("now") java.time.Instant now);
}

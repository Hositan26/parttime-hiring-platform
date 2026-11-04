package tanhs.fudn.parttime_hiring_plaform_project.repository.identity;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.PasswordResetToken;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, String> {
    // Serializes reset attempts so a credential cannot be reused.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from PasswordResetToken r join fetch r.user where r.tokenHash = :hash")
    Optional<PasswordResetToken> lockByHash(@Param("hash") String hash);
    // Removes outstanding reset credentials after a password change.
    void deleteByUser_Id(Long userId);
    // Deletes expired credentials without loading bearer data into memory.
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("delete from PasswordResetToken value where value.expiresAt < :now")
    void deleteExpired(@org.springframework.data.repository.query.Param("now") java.time.Instant now);
}

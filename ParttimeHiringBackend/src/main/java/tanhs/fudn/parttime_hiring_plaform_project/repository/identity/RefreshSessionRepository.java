package tanhs.fudn.parttime_hiring_plaform_project.repository.identity;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.RefreshSession;

public interface RefreshSessionRepository extends JpaRepository<RefreshSession, String> {
    // Serializes rotation attempts for the same refresh credential.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from RefreshSession s join fetch s.user where s.tokenHash = :hash")
    Optional<RefreshSession> lockByHash(@Param("hash") String hash);

    // Revokes every token in a replayed refresh family.
    @Modifying
    @Query("update RefreshSession s set s.revoked = true where s.family = :family")
    void revokeFamily(@Param("family") String family);

    // Revokes refresh credentials after an account security change.
    @Modifying
    @Query("update RefreshSession s set s.revoked = true where s.user.id = :userId")
    void revokeUser(@Param("userId") Long userId);
    // Deletes expired credentials without loading bearer data into memory.
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("delete from RefreshSession value where value.expiresAt < :now")
    void deleteExpired(@org.springframework.data.repository.query.Param("now") java.time.Instant now);
}

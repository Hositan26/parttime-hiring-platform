package tanhs.fudn.parttime_hiring_plaform_project.repository.identity;

import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;

import java.util.Optional;

/**
 * Interface Repository tương tác với bảng User trong cơ sở dữ liệu.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Tìm kiếm người dùng dựa trên username.
     * @param username Tên đăng nhập cần tìm.
     * @return User nếu tìm thấy, hoặc Optional.empty() nếu không tồn tại.
     */
    Optional<User> findByUsername(String username);
    // Locks account credentials while authenticating or changing sensitive state.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.username = :username")
    Optional<User> lockByUsername(@Param("username") String username);

    /**
     * Kiểm tra xem username đã tồn tại trong hệ thống hay chưa.
     * @param username Tên đăng nhập cần kiểm tra.
     * @return true nếu đã tồn tại, false nếu chưa.
     */
    boolean existsByUsername(String username);
    Optional<User> findByEmail(String email);
    
    // Searches account names and emails with optional activity filtering.
    @Query("select u from User u where (:active is null or u.isActive = :active) and "
            + "(lower(u.username) like lower(concat('%', :query, '%')) or "
            + "lower(u.displayName) like lower(concat('%', :query, '%')) or "
            + "lower(u.email) like lower(concat('%', :query, '%')))")
    org.springframework.data.domain.Page<User> searchAdministration(@Param("query") String query,
            @Param("active") Boolean active, org.springframework.data.domain.Pageable pageable);

    long countByCreatedAtAfter(LocalDateTime date);
}

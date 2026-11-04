package tanhs.fudn.parttime_hiring_plaform_project.repository.identity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.UserNotification;

public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {
    // Returns a bounded notification list for one authenticated recipient.
    Page<UserNotification> findByUser_Id(Long userId, Pageable pageable);
}

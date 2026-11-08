package tanhs.fudn.parttime_hiring_plaform_project.service.user;

import org.springframework.data.domain.Page;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.JobApplication;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.UserNotificationResponse;

public interface UserNotificationService {
    // Persists an application decision notification in the caller's transaction.
    void decision(JobApplication application);
    // Notifies the owner of an application about candidate activity.
    void employerActivity(JobApplication application, String message);
    // Lists only the authenticated recipient's notifications.
    Page<UserNotificationResponse> list(String username, int page, int size);
    // Marks an owned notification as read, preserving its first read time.
    void read(String username, Long id);
}

package tanhs.fudn.parttime_hiring_plaform_project.service.impl.user;

import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.JobApplication;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.UserNotificationResponse;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.exception.ResourceNotFoundException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.UserNotificationMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserNotificationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.UserNotificationService;

@Service @RequiredArgsConstructor @Slf4j
public class UserNotificationServiceImpl implements UserNotificationService {
    private final UserRepository users;
    private final UserNotificationRepository notifications;
    private final UserNotificationMapper mapper;
    // Saves notifications atomically with the application decision.
    @Transactional
    public void decision(JobApplication application) { notifications.save(mapper.decision(application)); }
    // Bounds queries and derives recipient ownership from authentication.
    @Transactional(readOnly = true)
    public Page<UserNotificationResponse> list(String username, int page, int size) {
        if (page < 0 || size < 1 || size > 50) throw new BusinessException("Invalid page bounds");
        var user = users.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return notifications.findByUser_Id(user.getId(), PageRequest.of(page, size, Sort.by("id").descending())).map(mapper::toResponse);
    }
    // Rejects foreign notifications before updating the read timestamp.
    @Transactional
    public void read(String username, Long id) {
        var user = users.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        var notification = notifications.findById(id).orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getUser().getId().equals(user.getId())) throw new AccessDeniedException("Notification belongs to another account");
        if (notification.getReadAt() == null) {
            notification.setReadAt(LocalDateTime.now()); notifications.save(notification);
        }
    }
}

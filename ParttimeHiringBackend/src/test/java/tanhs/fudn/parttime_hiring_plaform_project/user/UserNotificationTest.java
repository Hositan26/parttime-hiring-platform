package tanhs.fudn.parttime_hiring_plaform_project.user;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.UserNotification;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.UserNotificationMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserNotificationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.user.UserNotificationServiceImpl;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserNotificationTest {
    // Rejects foreign notifications and makes repeated read requests idempotent.
    @Test
    void protectsRecipientAndFirstReadTime() {
        UserRepository users = mock(UserRepository.class);
        UserNotificationRepository notifications = mock(UserNotificationRepository.class);
        var service = new UserNotificationServiceImpl(users, notifications, mock(UserNotificationMapper.class));
        User owner = User.builder().id(1L).build();
        when(users.findByUsername("candidate")).thenReturn(Optional.of(owner));
        UserNotification notification = new UserNotification(); notification.setUser(User.builder().id(2L).build());
        when(notifications.findById(5L)).thenReturn(Optional.of(notification));
        assertThrows(AccessDeniedException.class, () -> service.read("candidate", 5L));
        notification.setUser(owner); service.read("candidate", 5L);
        var first = notification.getReadAt(); service.read("candidate", 5L);
        assertNotNull(first); assertEquals(first, notification.getReadAt());
        verify(notifications, times(1)).save(notification);
    }
}

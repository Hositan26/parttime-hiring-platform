package tanhs.fudn.parttime_hiring_plaform_project.user;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.security.crypto.password.PasswordEncoder;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.UserProfileUpdateRequest;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.UserProfileMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.user.UserProfileServiceImpl;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProfileUpdateTest {
    private final UserRepository users = mock(UserRepository.class);
    private final PasswordEncoder passwords = mock(PasswordEncoder.class);
    private final UserProfileServiceImpl service = new UserProfileServiceImpl(users,
            Mappers.getMapper(UserProfileMapper.class), passwords);

    // Requires password confirmation before mutating a password-based account.
    @Test
    void rejectsInvalidPassword() {
        User user = User.builder().id(1L).password("hash").build();
        when(users.lockByUsername("candidate")).thenReturn(Optional.of(user));
        assertThrows(BusinessException.class, () -> service.updateCurrentUserProfile("candidate", new UserProfileUpdateRequest()));
        verify(users, never()).saveAndFlush(any());
    }

    // Rejects identifiers owned by another account before mapping submitted changes.
    @Test
    void rejectsDuplicateUsername() {
        User user = User.builder().id(1L).username("candidate").build();
        when(users.lockByUsername("candidate")).thenReturn(Optional.of(user));
        when(users.findByUsername("other")).thenReturn(Optional.of(User.builder().id(2L).build()));
        UserProfileUpdateRequest request = new UserProfileUpdateRequest();
        request.setUsername("other");
        assertThrows(BusinessException.class, () -> service.updateCurrentUserProfile("candidate", request));
        assertEquals("candidate", user.getUsername());
    }

    // Preserves account identity and credentials while mapping editable profile fields.
    @Test
    void preservesProtectedFields() {
        User user = User.builder().id(1L).password("hash").username("candidate").build();
        UserProfileUpdateRequest request = new UserProfileUpdateRequest();
        request.setUsername("updated");
        request.setCurrentPassword("plain");
        Mappers.getMapper(UserProfileMapper.class).updateProfile(request, user);
        assertEquals(1L, user.getId());
        assertEquals("hash", user.getPassword());
        assertEquals("updated", user.getUsername());
    }
}

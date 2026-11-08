package tanhs.fudn.parttime_hiring_plaform_project.user;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Optional;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.CloudinaryResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.UserProfileMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.common.CloudinaryService;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.user.UserAvatarServiceImpl;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserAvatarTest {
    // Rejects content spoofing before any external upload occurs.
    @Test
    void rejectsSpoofedImage() {
        UserRepository users = mock(UserRepository.class);
        CloudinaryService storage = mock(CloudinaryService.class);
        when(users.lockByUsername("candidate")).thenReturn(Optional.of(User.builder().id(1L).build()));
        var service = new UserAvatarServiceImpl(users, storage, mock(UserProfileMapper.class));
        var file = new MockMultipartFile("file", "avatar.png", "image/png", "not an image".getBytes());
        assertThrows(BusinessException.class, () -> service.upload("candidate", file));
        verifyNoInteractions(storage);
    }

    // Uploads a genuine image and changes only the authenticated account.
    @Test
    void acceptsDecodedImage() throws Exception {
        UserRepository users = mock(UserRepository.class);
        CloudinaryService storage = mock(CloudinaryService.class);
        User user = User.builder().id(1L).build();
        when(users.lockByUsername("candidate")).thenReturn(Optional.of(user));
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB), "png", bytes);
        var file = new MockMultipartFile("file", "avatar.png", "image/png", bytes.toByteArray());
        when(storage.uploadFile(file, "user-avatars/1")).thenReturn(CloudinaryResponse.builder()
                .url("https://example.invalid/avatar.png").build());
        var service = new UserAvatarServiceImpl(users, storage, mock(UserProfileMapper.class));
        service.upload("candidate", file);
        assertEquals("https://example.invalid/avatar.png", user.getAvatarUrl());
        verify(users).save(user);
    }
}

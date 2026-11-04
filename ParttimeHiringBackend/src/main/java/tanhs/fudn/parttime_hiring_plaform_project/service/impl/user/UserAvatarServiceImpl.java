package tanhs.fudn.parttime_hiring_plaform_project.service.impl.user;

import java.io.IOException;
import java.util.Set;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.UserProfileResponse;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.exception.ResourceNotFoundException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.UserProfileMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.common.CloudinaryService;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.UserAvatarService;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserAvatarServiceImpl implements UserAvatarService {
    private static final long MAX_BYTES = 5 * 1024 * 1024;
    private static final int MAX_DIMENSION = 4096;
    private final UserRepository users;
    private final CloudinaryService storage;
    private final UserProfileMapper mapper;

    // Validates image bytes and updates only the authenticated user's avatar.
    @Transactional
    public UserProfileResponse upload(String username, MultipartFile file) {
        var user = users.lockByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        validateImage(file);
        try {
            var uploaded = storage.uploadFile(file, "user-avatars/" + user.getId());
            if (uploaded == null || uploaded.getUrl() == null || !uploaded.getUrl().startsWith("https://")) {
                throw new BusinessException("Image storage returned an invalid response");
            }
            user.setAvatarUrl(uploaded.getUrl());
            return mapper.toResponse(users.save(user));
        } catch (IOException exception) {
            throw new BusinessException("Cannot upload avatar. Please try again.");
        }
    }

    // Rejects spoofed images and bounds decoded dimensions before reading pixels.
    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty() || file.getSize() > MAX_BYTES) {
            throw new BusinessException("Avatar must be a JPEG or PNG image up to 5 MB");
        }
        try (ImageInputStream input = ImageIO.createImageInputStream(file.getInputStream())) {
            if (input == null) throw new BusinessException("Invalid image");
            var readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) throw new BusinessException("Invalid JPEG or PNG image");
            ImageReader reader = readers.next();
            try {
                reader.setInput(input);
                String format = reader.getFormatName().toLowerCase(java.util.Locale.ROOT);
                if (!Set.of("jpeg", "png").contains(format) || reader.getWidth(0) > MAX_DIMENSION
                        || reader.getHeight(0) > MAX_DIMENSION || reader.read(0) == null) {
                    throw new BusinessException("Avatar dimensions must not exceed 4096 pixels");
                }
            } finally { reader.dispose(); }
        } catch (IOException exception) {
            throw new BusinessException("Invalid image data");
        }
    }
}

package tanhs.fudn.parttime_hiring_plaform_project.service.impl.user;

import java.io.IOException;
import tanhs.fudn.parttime_hiring_plaform_project.util.ImageUploads;
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
    private final UserRepository users;
    private final CloudinaryService storage;
    private final UserProfileMapper mapper;

    // Validates image bytes and updates only the authenticated user's avatar.
    @Transactional
    public UserProfileResponse upload(String username, MultipartFile file) {
        var user = users.lockByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ImageUploads.validate(file);
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

}

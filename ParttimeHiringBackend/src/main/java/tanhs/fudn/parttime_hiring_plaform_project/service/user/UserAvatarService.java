package tanhs.fudn.parttime_hiring_plaform_project.service.user;

import org.springframework.web.multipart.MultipartFile;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.UserProfileResponse;

public interface UserAvatarService {
    // Replaces the authenticated account's avatar with a validated image.
    UserProfileResponse upload(String username, MultipartFile file);
}

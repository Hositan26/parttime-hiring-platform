package tanhs.fudn.parttime_hiring_plaform_project.service.user;

import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.UserProfileUpdateRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.UserProfileResponse;

public interface UserProfileService {
    UserProfileResponse getCurrentUserProfile(String username);
    UserProfileResponse updateCurrentUserProfile(String username, UserProfileUpdateRequest request);
}

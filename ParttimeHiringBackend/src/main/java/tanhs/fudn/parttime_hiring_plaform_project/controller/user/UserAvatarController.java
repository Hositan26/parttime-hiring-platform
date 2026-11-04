package tanhs.fudn.parttime_hiring_plaform_project.controller.user;

import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.UserProfileResponse;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.UserAvatarService;

@RestController
@RequestMapping("/api/users/me/avatar")
@RequiredArgsConstructor
public class UserAvatarController {
    private final UserAvatarService service;

    // Uploads a validated avatar for the account selected by authentication.
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserProfileResponse>> upload(Principal principal,
            @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success(service.upload(principal.getName(), file)));
    }
}

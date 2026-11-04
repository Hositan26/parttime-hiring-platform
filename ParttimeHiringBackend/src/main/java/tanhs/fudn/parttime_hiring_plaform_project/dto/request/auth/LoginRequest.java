package tanhs.fudn.parttime_hiring_plaform_project.dto.request.auth;

import jakarta.validation.constraints.Size;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Lớp DTO chứa thông tin yêu cầu đăng nhập.
 */
@Data
public class LoginRequest {

    @NotBlank(message = "Username không được để trống")
    @Size(max = 50)
    private String username;

    @NotBlank(message = "Password không được để trống")
    @Size(max = 72)
    private String password;
}

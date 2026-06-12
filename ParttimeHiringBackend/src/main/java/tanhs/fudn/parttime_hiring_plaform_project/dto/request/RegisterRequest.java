package tanhs.fudn.parttime_hiring_plaform_project.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Lớp DTO chứa thông tin yêu cầu đăng ký tài khoản.
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "Username không được để trống")
    private String username;

    @NotBlank(message = "Password không được để trống")
    private String password;

    private String displayName;

    private String dateOfBirth;
}

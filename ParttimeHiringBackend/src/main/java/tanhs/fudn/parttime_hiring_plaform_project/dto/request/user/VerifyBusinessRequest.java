package tanhs.fudn.parttime_hiring_plaform_project.dto.request.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import org.springframework.web.multipart.MultipartFile;

@Data
public class VerifyBusinessRequest {

    @NotBlank(message = "Tên cửa hàng không được để trống")
    @Size(max = 255)
    private String storeName;

    @NotBlank(message = "Tên người đại diện không được để trống")
    @Size(max = 255)
    private String representativeName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    @Size(max = 255)
    private String email;

    @NotBlank(message = "Mã xác thực OTP không được để trống")
    @Pattern(regexp = "[0-9]{6}")
    private String otpCode;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "\\+?[0-9]{9,15}")
    private String phone;

    @NotBlank(message = "Địa chỉ không được để trống")
    @Size(max = 255)
    private String address;

    @Size(max = 50)
    private String taxCode;
    @Size(max = 255)
    @Pattern(regexp = "^$|https?://[^\\s]+", message = "Website must use HTTP or HTTPS")
    private String websiteFanpageUrl;

    @NotNull(message = "Ảnh mặt tiền cửa hàng là bắt buộc")
    private MultipartFile storeFrontImage;

    @NotNull(message = "Ảnh CCCD mặt trước là bắt buộc")
    private MultipartFile idCardFront;

    @NotNull(message = "Ảnh CCCD mặt sau là bắt buộc")
    private MultipartFile idCardBack;

    private MultipartFile businessLicense;
}

package tanhs.fudn.parttime_hiring_plaform_project.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class VerifyBusinessRequest {

    @NotBlank(message = "Tên cửa hàng không được để trống")
    private String storeName;

    @NotBlank(message = "Tên người đại diện không được để trống")
    private String representativeName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Mã xác thực OTP không được để trống")
    private String otpCode;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phone;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;

    private String taxCode;
    private String websiteFanpageUrl;

    @NotNull(message = "Ảnh mặt tiền cửa hàng là bắt buộc")
    private MultipartFile storeFrontImage;

    @NotNull(message = "Ảnh CCCD mặt trước là bắt buộc")
    private MultipartFile idCardFront;

    @NotNull(message = "Ảnh CCCD mặt sau là bắt buộc")
    private MultipartFile idCardBack;

    private MultipartFile businessLicense;
}

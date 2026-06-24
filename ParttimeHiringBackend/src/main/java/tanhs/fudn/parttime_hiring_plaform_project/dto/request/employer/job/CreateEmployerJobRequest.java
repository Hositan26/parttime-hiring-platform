package tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.job;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmploymentType;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.GenderRequirement;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CreateEmployerJobRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotNull(message = "Cửa hàng không được để trống")
    private Integer storeId;

    @NotBlank(message = "Mô tả không được để trống")
    private String jobDescription;

    private String requirements;

    private String benefits;

    @NotNull(message = "Lương tối thiểu không được để trống")
    private BigDecimal hourlyWageMin;

    private BigDecimal hourlyWageMax;

    private String currency = "VND";

    @NotNull(message = "Số lượng tuyển không được để trống")
    private Integer vacancyCount;

    private Integer minAge;
    private Integer maxAge;

    @NotNull(message = "Yêu cầu giới tính không được để trống")
    private GenderRequirement genderRequirement;

    @NotNull(message = "Loại hình công việc không được để trống")
    private EmploymentType employmentType;

    @NotNull(message = "Hạn nộp hồ sơ không được để trống")
    private LocalDate expiredAt;

    private List<Integer> shiftIds;
    private List<Integer> categoryIds;
}

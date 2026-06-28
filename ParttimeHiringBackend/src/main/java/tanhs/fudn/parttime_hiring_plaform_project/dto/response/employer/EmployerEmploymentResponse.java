package tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployerEmploymentResponse {
    private Integer recordId;
    
    // Employee Info
    private Integer userId;
    private String employeeName;
    private String employeeAvatar;
    private String employeePhone;
    private String employeeEmail;
    
    // Job & Store Info
    private Integer jobPostId;
    private String jobTitle;
    private Integer storeId;
    private String storeName;
    private String storeAddress;
    
    // Application Info (for link back)
    private Integer applicationId;
    
    // Employment Info
    private LocalDate startDate;
    private LocalDate endDate;
    private String workStatus; // WORKING, QUIT, TERMINATED
    private String note;
    
    private LocalDateTime createdAt;
}

package tanhs.fudn.parttime_hiring_plaform_project.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.dashboard.DashboardOverviewResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.dashboard.ExpiringJobResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.dashboard.MonthlyStatResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.dashboard.RecentApplicationResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.JobApplication;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DashboardMapper {

    @Mapping(target = "name", source = "app.applicant.displayName")
    @Mapping(target = "role", source = "app.jobPost.title")
    @Mapping(target = "store", source = "app.jobPost.store.storeName")
    @Mapping(target = "time", source = "timeAgo")
    @Mapping(target = "status", expression = "java(app.getStatus() != null && \"PENDING\".equals(app.getStatus().name()) ? \"Chờ xử lý\" : (app.getStatus() != null && \"ACCEPTED\".equals(app.getStatus().name()) ? \"Đã nhận\" : \"Từ chối\"))")
    @Mapping(target = "isPending", expression = "java(app.getStatus() != null && \"PENDING\".equals(app.getStatus().name()))")
    @Mapping(target = "img", expression = "java(app.getApplicant().getAvatarUrl() != null ? app.getApplicant().getAvatarUrl() : \"https://i.pravatar.cc/150\")")
    RecentApplicationResponse toRecentApplicationDTO(JobApplication app, String timeAgo);

    @Mapping(target = "name", source = "job.title")
    @Mapping(target = "store", source = "job.store.storeName")
    @Mapping(target = "expire", source = "daysLeftString")
    @Mapping(target = "logo", constant = "https://cdn-icons-png.flaticon.com/512/3268/3268832.png")
    ExpiringJobResponse toExpiringJobDTO(JobPost job, String daysLeftString);

    @Mapping(target = "verificationStatus", expression = "java(employer.getStatus() != null && \"ACTIVE\".equals(employer.getStatus().name()) ? \"Đã xác minh\" : \"Chờ xác minh\")")
    @Mapping(target = "verificationDate", expression = "java(employer.getUpdatedAt() != null ? employer.getUpdatedAt().format(java.time.format.DateTimeFormatter.ofPattern(\"dd/MM/yyyy\")) : (employer.getCreatedAt() != null ? employer.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern(\"dd/MM/yyyy\")) : \"N/A\"))")
    DashboardOverviewResponse toDashboardOverviewResponse(
            Employer employer, 
            long totalStores, long totalJobs, long totalApplications, long pendingApplications,
            List<MonthlyStatResponse> monthlyStats, 
            List<RecentApplicationResponse> recentApplications, 
            List<ExpiringJobResponse> expiringJobs);
}

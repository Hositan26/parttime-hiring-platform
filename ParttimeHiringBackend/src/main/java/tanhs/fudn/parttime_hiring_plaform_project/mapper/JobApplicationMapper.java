package tanhs.fudn.parttime_hiring_plaform_project.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.application.JobApplicationResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.application.EmployerApplicationResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.JobApplication;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;

@Mapper(componentModel = "spring")
public interface JobApplicationMapper {

    @Mapping(target = "applicationId", source = "applicationId")
    @Mapping(target = "jobPostId", source = "jobPost.jobPostId")
    @Mapping(target = "jobTitle", source = "jobPost.title")
    @Mapping(target = "companyName", expression = "java(getCompanyName(application.getJobPost()))")
    @Mapping(target = "storeFrontImageUrl", expression = "java(getStoreFrontImageUrl(application.getJobPost()))")
    @Mapping(target = "contactPhone", source = "contactPhone")
    @Mapping(target = "note", source = "note")
    @Mapping(target = "status", expression = "java(application.getStatus().name())")
    @Mapping(target = "jobStatus", expression = "java(application.getJobPost().getStatus() != null ? application.getJobPost().getStatus().name() : \"\")")
    @Mapping(target = "appliedAt", source = "appliedAt")
    JobApplicationResponse toJobApplicationResponse(JobApplication application);

    @Mapping(target = "applicationId", source = "applicationId")
    @Mapping(target = "applicantId", source = "applicant.id")
    @Mapping(target = "applicantName", source = "applicant.displayName")
    @Mapping(target = "applicantEmail", source = "applicant.email")
    @Mapping(target = "applicantPhone", source = "contactPhone")
    @Mapping(target = "applicantAvatar", source = "applicant.avatarUrl")
    @Mapping(target = "jobTitle", source = "jobPost.title")
    @Mapping(target = "jobPostId", source = "jobPost.jobPostId")
    @Mapping(target = "storeName", source = "jobPost.store.storeName")
    @Mapping(target = "storeAddress", source = "jobPost.store.streetAddress")
    @Mapping(target = "appliedDate", expression = "java(application.getAppliedAt().toLocalDate().format(java.time.format.DateTimeFormatter.ofPattern(\"dd/MM/yyyy\")))")
    @Mapping(target = "appliedTime", expression = "java(application.getAppliedAt().toLocalTime().format(java.time.format.DateTimeFormatter.ofPattern(\"HH:mm\")))")
    @Mapping(target = "status", expression = "java(application.getStatus().name())")
    @Mapping(target = "note", source = "note")
    EmployerApplicationResponse toEmployerApplicationResponse(JobApplication application);

    default String getCompanyName(JobPost job) {
        if (job != null && job.getStore() != null) {
            return job.getStore().getStoreName();
        }
        return "Công ty ẩn danh";
    }

    default String getStoreFrontImageUrl(JobPost job) {
        if (job != null && job.getImages() != null && !job.getImages().isEmpty()) {
            return job.getImages().get(0).getImageUrl();
        }
        return null;
    }
}

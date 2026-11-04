package tanhs.fudn.parttime_hiring_plaform_project.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.BeanMapping;
import org.mapstruct.MappingTarget;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.application.ApplicationUpdateRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.application.JobApplicationResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.application.EmployerApplicationResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.JobApplication;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employment.EmploymentRecord;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.application.JobApplicationRequest;

@Mapper(componentModel = "spring")
public interface JobApplicationMapper {
    // Creates a pending application with server-resolved applicant and job ownership.
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "applicant", source = "applicant")
    @Mapping(target = "jobPost", source = "job")
    @Mapping(target = "contactPhone", source = "request.contactPhone")
    @Mapping(target = "note", source = "request.note")
    @Mapping(target = "status", constant = "PENDING")
    JobApplication create(JobApplicationRequest request, User applicant, JobPost job);
    // Creates verified employment only from an accepted employer-owned application.
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "user", source = "application.applicant")
    @Mapping(target = "store", source = "application.jobPost.store")
    @Mapping(target = "jobPost", source = "application.jobPost")
    @Mapping(target = "application", source = "application")
    @Mapping(target = "verifiedByEmployer", source = "employer")
    @Mapping(target = "startDate", expression = "java(java.time.LocalDate.now())")
    @Mapping(target = "verifiedAt", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "workStatus", constant = "WORKING")
    EmploymentRecord toEmployment(JobApplication application, Employer employer);
    // Updates contact details without changing applicant, job, or decision state.
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "contactPhone", source = "contactPhone")
    @Mapping(target = "note", source = "note")
    void updateContact(ApplicationUpdateRequest request, @MappingTarget JobApplication application);

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

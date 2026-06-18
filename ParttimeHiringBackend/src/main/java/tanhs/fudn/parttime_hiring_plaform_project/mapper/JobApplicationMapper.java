package tanhs.fudn.parttime_hiring_plaform_project.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tanhs.fudn.parttime_hiring_plaform_project.dto.application.JobApplicationResponse;
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
    @Mapping(target = "appliedAt", source = "appliedAt")
    JobApplicationResponse toJobApplicationResponse(JobApplication application);

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

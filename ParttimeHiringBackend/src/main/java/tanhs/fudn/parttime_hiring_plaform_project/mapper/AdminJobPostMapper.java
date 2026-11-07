package tanhs.fudn.parttime_hiring_plaform_project.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.jobpost.AdminJobPostResponse;

@Mapper(componentModel = "spring")
public interface AdminJobPostMapper {
    // Maps moderation details even when a listing is not publicly available.
    @Mapping(target = "description", source = "jobDescription")
    @Mapping(target = "jobId", source = "jobPostId")
    @Mapping(target = "storeName", source = "store.storeName")
    @Mapping(target = "employerId", source = "employer.employerId")
    @Mapping(target = "companyName", source = "employer.companyName")
    AdminJobPostResponse toResponse(JobPost job);
}

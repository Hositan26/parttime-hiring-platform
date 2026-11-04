package tanhs.fudn.parttime_hiring_plaform_project.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.SavedJob;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;

@Mapper(componentModel = "spring")
public interface SavedJobMapper {
    // Creates an account-owned saved opportunity without copying identifiers.
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", source = "user")
    @Mapping(target = "jobPost", source = "job")
    SavedJob create(User user, JobPost job);
}

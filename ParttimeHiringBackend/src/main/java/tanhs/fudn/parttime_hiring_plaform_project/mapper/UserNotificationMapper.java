package tanhs.fudn.parttime_hiring_plaform_project.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.BeanMapping;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.JobApplication;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.UserNotification;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.UserNotificationResponse;

@Mapper(componentModel = "spring")
public interface UserNotificationMapper {
    // Addresses an application decision notification to its actual candidate.
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "user", source = "applicant")
    @Mapping(target = "applicationId", source = "applicationId")
    @Mapping(target = "message", expression = "java(application.getJobPost().getTitle() + \": \" + application.getStatus().name())")
    @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
    UserNotification decision(JobApplication application);
    // Exposes notification content without recipient account internals.
    UserNotificationResponse toResponse(UserNotification notification);
}

package tanhs.fudn.parttime_hiring_plaform_project.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.employer.AdminEmployerResponse;

@Mapper(componentModel = "spring")
public interface AdminEmployerMapper {
    // Separates business standing from the associated account login state.
    @Mapping(target = "userId", source = "employer.userId")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "isActive", source = "user.isActive")
    AdminEmployerResponse toResponse(Employer employer, User user);
}

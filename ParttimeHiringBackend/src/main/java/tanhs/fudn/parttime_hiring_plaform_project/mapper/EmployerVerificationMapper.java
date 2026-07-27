package tanhs.fudn.parttime_hiring_plaform_project.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.EmployerVerificationStatusResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.EmployerVerification;

@Mapper(componentModel = "spring")
public interface EmployerVerificationMapper {

    @Mapping(target = "status", expression = "java(verification.getVerificationStatus() != null ? verification.getVerificationStatus().name() : null)")
    @Mapping(target = "submittedAt", source = "submittedAt")
    @Mapping(target = "rejectionReason", source = "rejectionReason")
    EmployerVerificationStatusResponse toEmployerVerificationStatusResponse(EmployerVerification verification);
}

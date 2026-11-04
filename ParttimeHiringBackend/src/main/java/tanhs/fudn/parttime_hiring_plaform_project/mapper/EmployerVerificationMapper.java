package tanhs.fudn.parttime_hiring_plaform_project.mapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.EmployerVerificationStatusResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.verification.VerificationListResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.verification.VerificationDetailResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.EmployerVerification;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EmployerVerificationMapper {
    // Maps the applicant's latest verification status.
    @Mapping(target = "status", source = "verificationStatus")
    EmployerVerificationStatusResponse toEmployerVerificationStatusResponse(EmployerVerification verification);

    // Maps the public administration summary without exposing identity documents.
    @Mapping(target = "status", source = "verificationStatus")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "username", source = "user.username")
    VerificationListResponse toList(EmployerVerification verification);

    // Maps verification documents for authorized administration review.
    @Mapping(target = "status", source = "verificationStatus")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "email", source = "user.email")
    VerificationDetailResponse toDetail(EmployerVerification verification);

    // Creates an approved employer profile from verified application details.
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "emailContact", source = "contactEmail")
    @Mapping(target = "status", constant = "ACTIVE")
    Employer toEmployer(EmployerVerification verification);
}

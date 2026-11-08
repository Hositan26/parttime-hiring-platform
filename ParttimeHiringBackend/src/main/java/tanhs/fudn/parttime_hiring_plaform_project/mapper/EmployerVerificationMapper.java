package tanhs.fudn.parttime_hiring_plaform_project.mapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.BeanMapping;
import org.mapstruct.MappingTarget;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.VerifyBusinessRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.CloudinaryResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.EmployerVerificationStatusResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.verification.VerificationListResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.verification.VerificationDetailResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.EmployerVerification;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EmployerVerificationMapper {
    // Maps validated business details without trusting client review state or ownership.
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "user", source = "user")
    @Mapping(target = "companyName", source = "request.storeName")
    @Mapping(target = "representativeName", source = "request.representativeName")
    @Mapping(target = "contactEmail", source = "request.email")
    @Mapping(target = "phoneContact", source = "request.phone")
    @Mapping(target = "address", source = "request.address")
    @Mapping(target = "taxCode", source = "request.taxCode")
    @Mapping(target = "websiteFanpageUrl", source = "request.websiteFanpageUrl")
    @Mapping(target = "verificationStatus", constant = "PENDING")
    EmployerVerification create(VerifyBusinessRequest request, User user);
    // Attaches uploaded document references while preserving application state.
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "storeFrontImageUrl", source = "store.url")
    @Mapping(target = "storeFrontImagePublicId", source = "store.publicId")
    @Mapping(target = "idCardFrontUrl", source = "front.url")
    @Mapping(target = "idCardFrontPublicId", source = "front.publicId")
    @Mapping(target = "idCardBackUrl", source = "back.url")
    @Mapping(target = "idCardBackPublicId", source = "back.publicId")
    @Mapping(target = "businessLicenseUrl", source = "license.url")
    @Mapping(target = "businessLicensePublicId", source = "license.publicId")
    void documents(CloudinaryResponse store, CloudinaryResponse front, CloudinaryResponse back,
            CloudinaryResponse license, @MappingTarget EmployerVerification verification);
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

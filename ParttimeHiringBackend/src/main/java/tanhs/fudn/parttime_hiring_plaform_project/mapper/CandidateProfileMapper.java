package tanhs.fudn.parttime_hiring_plaform_project.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.BeanMapping;
import org.mapstruct.MappingTarget;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.CandidateProfile;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.CandidateProfileRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.CandidateProfileResponse;

@Mapper(componentModel = "spring")
public interface CandidateProfileMapper {
    // Creates an empty profile owned by the authenticated account.
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "user", source = "user")
    CandidateProfile create(User user);
    // Copies editable resume text while preserving ownership and stored documents.
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "summary", source = "summary")
    @Mapping(target = "skills", source = "skills")
    @Mapping(target = "experience", source = "experience")
    void update(CandidateProfileRequest request, @MappingTarget CandidateProfile profile);
    // Exposes profile metadata without returning document bytes or internal identifiers.
    @Mapping(target = "displayName", source = "user.displayName")
    @Mapping(target = "hasResume", expression = "java(profile.getResumeData() != null)")
    CandidateProfileResponse toResponse(CandidateProfile profile);
}

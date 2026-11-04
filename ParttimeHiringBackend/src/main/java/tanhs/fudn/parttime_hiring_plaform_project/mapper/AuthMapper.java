package tanhs.fudn.parttime_hiring_plaform_project.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.auth.RegisterRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.auth.LoginResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.Role;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import java.time.LocalDate;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AuthMapper {
    // Maps validated registration data without accepting roles from clients.
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "dateOfBirth", expression = "java(parseBirthDate(request.getDateOfBirth()))")
    User toUser(RegisterRequest request);

    // Maps verified Google attributes without accepting account privileges.
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "roles", ignore = true)
    User toGoogleUser(String username, String email, String displayName, String avatarUrl);
    // Returns public account details without exposing credentials or tokens.
    LoginResponse toLoginResponse(User user);

    // Converts account roles into their public names.
    default String roleName(Role role) {
        return role.getRoleName();
    }

    // Parses an optional birth date for a new account.
    default LocalDate parseBirthDate(String value) {
        return value == null || value.isBlank() ? null : LocalDate.parse(value);
    }
}

package tanhs.fudn.parttime_hiring_plaform_project.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.BeanMapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.UserProfileUpdateRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.UserProfileResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.Role;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserProfileMapper {

    // Copies only editable profile fields while preserving credentials and roles.
    @BeanMapping(ignoreByDefault = true, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "displayName", source = "displayName")
    @Mapping(target = "username", source = "username")
    @Mapping(target = "email", source = "email")
    @Mapping(target = "dateOfBirth", source = "dateOfBirth")
    void updateProfile(UserProfileUpdateRequest request, @MappingTarget User user);

    @Mapping(target = "userId", source = "id")
    @Mapping(target = "dateOfBirth", source = "dateOfBirth", dateFormat = "yyyy-MM-dd")
    @Mapping(target = "hasPassword", expression = "java(entity.getPassword() != null && !entity.getPassword().isEmpty())")
    @Mapping(target = "roles", expression = "java(mapRoles(entity.getRoles()))")
    UserProfileResponse toResponse(User entity);

    default List<String> mapRoles(java.util.Set<Role> roles) {
        if (roles == null) return null;
        return roles.stream().map(Role::getRoleName).collect(Collectors.toList());
    }
}

package tanhs.fudn.parttime_hiring_plaform_project.mapper;

import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.user.AdminUserResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.Role;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface AdminUserMapper {
    // Maps account administration fields without exposing credentials.
    @Mapping(target = "roles", expression = "java(mapRoles(entity.getRoles()))")
    AdminUserResponse toAccountResponse(User entity);

    // Maps assigned authorities without exposing account credentials.
    default List<String> mapRoles(java.util.Set<Role> roles) {
        if (roles == null) return List.of();
        return roles.stream().map(Role::getRoleName).collect(Collectors.toList());
    }
}

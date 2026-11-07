package tanhs.fudn.parttime_hiring_plaform_project.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.AdminUserResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.Role;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface AdminUserMapper {
    // Maps account administration fields without exposing credentials.
    @Mapping(target = "roles", expression = "java(mapRoles(entity.getRoles()))")
    tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.user.AdminUserResponse toAccountResponse(User entity);

    @Mapping(target = "roles", expression = "java(mapRoles(entity.getRoles()))")
    AdminUserResponse toResponse(User entity);

    default List<String> mapRoles(java.util.Set<Role> roles) {
        if (roles == null) return List.of();
        return roles.stream().map(Role::getRoleName).collect(Collectors.toList());
    }
}

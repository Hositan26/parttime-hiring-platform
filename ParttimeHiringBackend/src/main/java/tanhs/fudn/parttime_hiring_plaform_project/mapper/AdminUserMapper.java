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
    @Mapping(target = "roles", expression = "java(mapRoles(entity.getRoles()))")
    AdminUserResponse toResponse(User entity);

    default List<String> mapRoles(java.util.Set<Role> roles) {
        if (roles == null) return null;
        return roles.stream().map(Role::getRoleName).collect(Collectors.toList());
    }
}

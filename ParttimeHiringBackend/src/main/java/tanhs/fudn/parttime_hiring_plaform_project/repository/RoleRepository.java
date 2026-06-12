package tanhs.fudn.parttime_hiring_plaform_project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.Role;

/**
 * Interface Repository tương tác với bảng Role trong cơ sở dữ liệu.
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, String> {
}

package tanhs.fudn.parttime_hiring_plaform_project.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entity đại diện cho vai trò người dùng (Role) trong hệ thống.
 * Ánh xạ với bảng `role` trong cơ sở dữ liệu.
 */
@Entity
@Table(name = "role")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Role {

    @Id
    @Column(name = "role_name")
    private String roleName;

    @Column(name = "description")
    private String description;
}

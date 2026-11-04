package tanhs.fudn.parttime_hiring_plaform_project.entity.identity;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "auth_password_resets")
@Getter
@Setter
public class PasswordResetToken {
    @Id
    private String tokenHash;
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;
    private Instant expiresAt;
}

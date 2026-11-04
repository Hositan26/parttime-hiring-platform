package tanhs.fudn.parttime_hiring_plaform_project.entity.identity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "auth_refresh_sessions")
@Getter
@Setter
public class RefreshSession {
    @Id @Column(length = 64)
    private String tokenHash;
    @Column(nullable = false)
    private String family;
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;
    @Column(nullable = false)
    private Instant expiresAt;
    private boolean consumed;
    private boolean revoked;
}

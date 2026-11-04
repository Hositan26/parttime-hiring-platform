package tanhs.fudn.parttime_hiring_plaform_project.entity.identity;

import java.time.LocalDateTime;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;

@Entity @Table(name = "user_notifications") @Getter @Setter
public class UserNotification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
    private User user;
    private Integer applicationId;
    @Column(nullable = false, length = 1000)
    private String message;
    @Column(nullable = false)
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}

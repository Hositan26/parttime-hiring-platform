package tanhs.fudn.parttime_hiring_plaform_project.entity.job;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import lombok.Getter;
import lombok.Setter;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;

@Entity
@Table(name = "user_saved_jobs", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "job_post_id"}))
@Getter
@Setter
public class SavedJob {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "job_post_id", nullable = false)
    private JobPost jobPost;
}

package tanhs.fudn.parttime_hiring_plaform_project.entity.application;

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
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import lombok.Getter;
import lombok.Setter;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.InteractionKind;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.InteractionStatus;

@Entity @Table(name = "recruitment_interactions") @Getter @Setter
public class RecruitmentInteraction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "author_id", nullable = false)
    private User author;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "recipient_id")
    private User recipient;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "application_id")
    private JobApplication application;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "job_post_id", nullable = false)
    private JobPost jobPost;
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private InteractionKind kind;
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private InteractionStatus status;
    @Column(nullable = false, length = 2000)
    private String body;
    private LocalDateTime meetingAt;
    @Column(nullable = false)
    private LocalDateTime createdAt;
}

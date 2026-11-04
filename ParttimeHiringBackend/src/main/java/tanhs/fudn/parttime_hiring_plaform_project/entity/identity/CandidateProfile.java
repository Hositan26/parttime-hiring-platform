package tanhs.fudn.parttime_hiring_plaform_project.entity.identity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.OneToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Column;
import jakarta.persistence.Lob;
import lombok.Getter;
import lombok.Setter;

@Entity @Table(name = "candidate_profiles") @Getter @Setter
public class CandidateProfile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    @Column(length = 2000)
    private String summary;
    @Column(length = 2000)
    private String skills;
    @Column(length = 5000)
    private String experience;
    @Lob @Column(name = "resume_data", columnDefinition = "LONGBLOB")
    private byte[] resumeData;
    private String resumeFileName;
}

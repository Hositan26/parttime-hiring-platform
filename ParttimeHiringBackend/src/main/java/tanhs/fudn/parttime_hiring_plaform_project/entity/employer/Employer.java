package tanhs.fudn.parttime_hiring_plaform_project.entity.employer;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmployerStatus;

@Entity
@Table(name = "employers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employer_id")
    private Integer employerId;

    @Column(name = "user_id", nullable = false, unique = true)
    private Integer userId;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "business_type")
    private String businessType;

    @Column(name = "email_contact")
    private String emailContact;

    @Column(name = "phone_contact")
    private String phoneContact;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "website")
    private String website;

    @Column(name = "tax_code")
    private String taxCode;

    @Column(name = "representative_name")
    private String representativeName;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private EmployerStatus status;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}

package tanhs.fudn.parttime_hiring_plaform_project.entity.employer;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.VerificationStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "employer_verifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployerVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "verification_id")
    private Integer verificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private User admin;

    @Column(name = "contact_email", nullable = false)
    private String contactEmail;

    @Column(name = "phone_contact", nullable = false)
    private String phoneContact;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "representative_name", nullable = false)
    private String representativeName;

    @Column(name = "store_front_image_url", nullable = false)
    private String storeFrontImageUrl;

    @Column(name = "store_front_image_public_id")
    private String storeFrontImagePublicId;

    @Column(name = "tax_code")
    private String taxCode;

    @Column(name = "business_license_url")
    private String businessLicenseUrl;

    @Column(name = "business_license_public_id")
    private String businessLicensePublicId;

    @Column(name = "website_fanpage_url")
    private String websiteFanpageUrl;

    @Column(name = "id_card_front_url", nullable = false)
    private String idCardFrontUrl;

    @Column(name = "id_card_front_public_id")
    private String idCardFrontPublicId;

    @Column(name = "id_card_back_url", nullable = false)
    private String idCardBackUrl;

    @Column(name = "id_card_back_public_id")
    private String idCardBackPublicId;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @CreationTimestamp
    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;
}

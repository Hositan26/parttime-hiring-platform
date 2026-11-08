package tanhs.fudn.parttime_hiring_plaform_project.entity.identity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_verification_otps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailVerificationOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "owner_user_id")
    private User owner;
    @Column(nullable = false, columnDefinition = "integer default 0")
    private int attempts;
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean verified;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "otp_code", nullable = false, length = 64)
    private String otpCode;

    @Column(name = "expiration_time", nullable = false)
    private LocalDateTime expirationTime;

    @Column(name = "is_used")
    @Builder.Default
    private boolean isUsed = false;
}


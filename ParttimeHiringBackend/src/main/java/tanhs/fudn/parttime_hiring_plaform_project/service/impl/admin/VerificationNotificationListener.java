package tanhs.fudn.parttime_hiring_plaform_project.service.impl.admin;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.EmailService;

@Slf4j
@Component
@RequiredArgsConstructor
public class VerificationNotificationListener {
    private final EmailService emailService;

    // Delivers review notifications without rolling back an approved employer account.
    @TransactionalEventListener
    public void notifyApplicant(AdminEmployerVerificationServiceImpl.VerificationDecision event) {
        try {
            emailService.sendVerificationStatusEmail(event.email(), event.company(), event.approved(), event.reason());
        } catch (RuntimeException exception) {
            log.warn("Verification notification delivery failed");
        }
    }
}

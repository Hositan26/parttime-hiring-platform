package tanhs.fudn.parttime_hiring_plaform_project.service.admin;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.verification.VerificationListResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.VerificationStatus;

@SpringBootTest
public class AdminEmployerVerificationServiceTest {

    @Autowired
    private AdminEmployerVerificationService service;

    @Test
    public void testGetVerifications() {
        System.out.println("====== START TEST ======");
        try {
            Page<VerificationListResponse> result = service.getVerifications(VerificationStatus.PENDING, 0, 10);
            System.out.println("Result total elements: " + result.getTotalElements());
            System.out.println("Result content size: " + result.getContent().size());
            if (result.getContent().size() > 0) {
                System.out.println("First element: " + result.getContent().get(0));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        System.out.println("====== END TEST ======");
    }
}

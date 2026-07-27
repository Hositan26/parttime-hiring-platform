package tanhs.fudn.parttime_hiring_plaform_project.service.employer;

import tanhs.fudn.parttime_hiring_plaform_project.service.employer.EmployerVerificationService;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.VerifyBusinessRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.EmployerVerificationStatusResponse;
import java.io.IOException;

public interface EmployerVerificationService {
    void submitVerification(VerifyBusinessRequest request, String username) throws java.io.IOException;
    EmployerVerificationStatusResponse getMyVerificationStatus(String username);
}
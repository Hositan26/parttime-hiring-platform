package tanhs.fudn.parttime_hiring_plaform_project.service.user;

import org.springframework.data.domain.Page;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.InteractionRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.InteractionResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.InteractionKind;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.InteractionStatus;

public interface RecruitmentInteractionService {
    // Lists a conversation after verifying application participation.
    Page<InteractionResponse> conversation(String username, Integer applicationId, int page);
    // Sends a message or proposes an interview to the other application participant.
    InteractionResponse send(String username, Integer applicationId, InteractionRequest request, InteractionKind kind);
    // Accepts, declines, or cancels an interview according to participant permissions.
    InteractionResponse respond(String username, Long id, InteractionStatus status);
    // Files a private moderation report for a recruitment opportunity.
    InteractionResponse report(String username, Integer jobId, InteractionRequest request);
    // Lists only reports filed by the authenticated account.
    Page<InteractionResponse> reports(String username, int page);
    // Lists all moderation reports for administrators.
    Page<InteractionResponse> adminReports(int page, InteractionStatus status);
    // Preserves the unfiltered administrator complaint queue contract.
    default Page<InteractionResponse> adminReports(int page) {
        return adminReports(page, null);
    }
    // Resolves an existing report after administrator review.
    void resolveReport(Long id);
}

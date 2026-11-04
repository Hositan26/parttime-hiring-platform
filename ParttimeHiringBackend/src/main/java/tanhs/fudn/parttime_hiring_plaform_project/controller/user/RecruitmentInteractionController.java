package tanhs.fudn.parttime_hiring_plaform_project.controller.user;

import java.security.Principal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.InteractionResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.InteractionRequest;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.InteractionKind;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.InteractionStatus;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.RecruitmentInteractionService;

@RestController @RequestMapping("/api/recruitment") @RequiredArgsConstructor
public class RecruitmentInteractionController {
    private final RecruitmentInteractionService service;
    // Lists application conversation entries after checking participant ownership.
    @GetMapping("/applications/{id}")
    public ResponseEntity<ApiResponse<Page<InteractionResponse>>> conversation(Principal principal,
            @PathVariable Integer id, @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(ApiResponse.success(service.conversation(principal.getName(), id, page)));
    }
    // Sends a validated private message to the other application participant.
    @PostMapping("/applications/{id}/messages")
    public ResponseEntity<ApiResponse<InteractionResponse>> message(Principal principal, @PathVariable Integer id,
            @Valid @RequestBody InteractionRequest request) {
        return ResponseEntity.status(201).body(ApiResponse.success(service.send(principal.getName(), id, request, InteractionKind.MESSAGE)));
    }
    // Proposes an interview with a validated future appointment time.
    @PostMapping("/applications/{id}/interviews")
    public ResponseEntity<ApiResponse<InteractionResponse>> interview(Principal principal, @PathVariable Integer id,
            @Valid @RequestBody InteractionRequest request) {
        return ResponseEntity.status(201).body(ApiResponse.success(service.send(principal.getName(), id, request, InteractionKind.INTERVIEW)));
    }
    // Accepts, declines, or cancels an interview according to participant permissions.
    @PutMapping("/interviews/{id}")
    public ResponseEntity<ApiResponse<InteractionResponse>> respond(Principal principal, @PathVariable Long id,
            @RequestParam InteractionStatus status) {
        return ResponseEntity.ok(ApiResponse.success(service.respond(principal.getName(), id, status)));
    }
    // Files a validated moderation report without exposing it publicly.
    @PostMapping("/jobs/{id}/reports")
    public ResponseEntity<ApiResponse<InteractionResponse>> report(Principal principal, @PathVariable Integer id,
            @Valid @RequestBody InteractionRequest request) {
        return ResponseEntity.status(201).body(ApiResponse.success(service.report(principal.getName(), id, request)));
    }
    // Lists only reports submitted by the authenticated account.
    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<Page<InteractionResponse>>> reports(Principal principal,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(ApiResponse.success(service.reports(principal.getName(), page)));
    }
}

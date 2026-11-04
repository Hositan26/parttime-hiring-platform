package tanhs.fudn.parttime_hiring_plaform_project.controller.user;

import java.security.Principal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.CandidateProfileRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.CandidateProfileResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.CandidateProfileService;

@RestController @RequestMapping("/api/candidate-profiles") @RequiredArgsConstructor
public class CandidateProfileController {
    private final CandidateProfileService service;
    // Returns private profile metadata for the authenticated candidate.
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<CandidateProfileResponse>> get(Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(service.get(principal.getName())));
    }
    // Updates validated skills, experience, and professional summary.
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<CandidateProfileResponse>> update(Principal principal,
            @Valid @RequestBody CandidateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.update(principal.getName(), request)));
    }
    // Uploads a private PDF document for the authenticated candidate.
    @PostMapping(value = "/me/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CandidateProfileResponse>> upload(Principal principal, @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success(service.upload(principal.getName(), file)));
    }
    // Downloads the owner's document with attachment and no-cache headers.
    @GetMapping("/me/resume")
    public ResponseEntity<byte[]> resume(Principal principal) { return download(service.resume(principal.getName())); }
    // Exposes candidate details only to authorized application participants.
    @GetMapping("/applications/{id}")
    public ResponseEntity<ApiResponse<CandidateProfileResponse>> shared(Principal principal, @PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(service.applicationProfile(principal.getName(), id)));
    }
    // Downloads a shared CV only after application ownership has been verified.
    @GetMapping("/applications/{id}/resume")
    public ResponseEntity<byte[]> sharedResume(Principal principal, @PathVariable Integer id) {
        return download(service.applicationResume(principal.getName(), id));
    }
    // Prevents inline rendering, MIME sniffing, and caching of private documents.
    private ResponseEntity<byte[]> download(byte[] bytes) {
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).header("Content-Disposition", "attachment; filename=resume.pdf")
                .header("X-Content-Type-Options", "nosniff").header("Cache-Control", "no-store")
                .header("Content-Security-Policy", "sandbox").body(bytes);
    }
}

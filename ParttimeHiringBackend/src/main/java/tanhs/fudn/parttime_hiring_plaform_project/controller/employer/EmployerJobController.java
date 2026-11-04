package tanhs.fudn.parttime_hiring_plaform_project.controller.employer;

import java.util.Map;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.job.CreateEmployerJobRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.job.UpdateEmployerJobRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.job.*;
import tanhs.fudn.parttime_hiring_plaform_project.service.common.CloudinaryService;
import tanhs.fudn.parttime_hiring_plaform_project.service.employer.EmployerJobService;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("isAuthenticated()")
public class EmployerJobController {

    EmployerJobService employerJobService;
    CloudinaryService cloudinaryService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<EmployerJobListResponse>>> getEmployerJobs(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer storeId,
            @RequestParam(required = false) JobStatus status
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                employerJobService.getEmployerJobs(principal.getName(), page, size, storeId, status)
        ));
    }

    // Returns job details only to the owning employer.
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployerJobDetailResponse>> getEmployerJobDetail(
            Principal principal,
            @PathVariable Integer id
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                employerJobService.getEmployerJobDetail(principal.getName(), id)
        ));
    }

    // Creates a recruitment post for an owned store.
    @PostMapping
    public ResponseEntity<ApiResponse<EmployerJobDetailResponse>> createEmployerJob(
            Principal principal,
            @Valid @RequestBody CreateEmployerJobRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                employerJobService.createEmployerJob(principal.getName(), request)
        ));
    }

    // Updates recruitment details after checking employer ownership.
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployerJobDetailResponse>> updateEmployerJob(
            Principal principal,
            @PathVariable Integer id,
            @Valid @RequestBody UpdateEmployerJobRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                employerJobService.updateEmployerJob(principal.getName(), id, request)
        ));
    }

    // Returns reviews associated with jobs owned by this employer.
    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<EmployerJobCommentResponse>>> getJobComments(
            Principal principal,
            @PathVariable Integer id
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                employerJobService.getJobComments(principal.getName(), id)
        ));
    }

    // Returns applicant details only for an owned job.
    @GetMapping("/{id}/applicants")
    public ResponseEntity<ApiResponse<List<EmployerJobApplicantResponse>>> getJobApplicants(
            Principal principal,
            @PathVariable Integer id
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                employerJobService.getJobApplicants(principal.getName(), id)
        ));
    }

    // Associates a new image with an owned recruitment post.
    @PostMapping(value = "/{id}/images", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<Void>> addJobImage(
            Principal principal,
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        employerJobService.getEmployerJobDetail(principal.getName(), id);
        var cloudinaryResponse = cloudinaryService.uploadFile(file, "job_posts");
        employerJobService.addJobImage(principal.getName(), id, cloudinaryResponse.getUrl());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // Removes an image only from an owned recruitment post.
    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deleteJobImage(
            Principal principal,
            @PathVariable Integer id,
            @PathVariable Integer imageId
    ) {
        employerJobService.deleteJobImage(principal.getName(), id, imageId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // Changes recruitment state after validating ownership and expiration.
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> patchJobStatus(
            Principal principal,
            @PathVariable Integer id,
            @RequestBody Map<String, String> body
    ) {
        JobStatus status =
                JobStatus.valueOf(body.get("status"));
        employerJobService.patchJobStatus(principal.getName(), id, status);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // Deletes an owned post when no applications depend on it.
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteJob(
            Principal principal,
            @PathVariable Integer id
    ) {
        employerJobService.deleteJob(principal.getName(), id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

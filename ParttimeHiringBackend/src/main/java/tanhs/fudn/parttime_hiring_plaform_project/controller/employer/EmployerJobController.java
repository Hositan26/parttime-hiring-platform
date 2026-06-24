package tanhs.fudn.parttime_hiring_plaform_project.controller.employer;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.job.AddJobImageRequest;
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
            @RequestParam(required = false) tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus status
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                employerJobService.getEmployerJobs(principal.getName(), page, size, storeId, status)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployerJobDetailResponse>> getEmployerJobDetail(
            Principal principal,
            @PathVariable Integer id
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                employerJobService.getEmployerJobDetail(principal.getName(), id)
        ));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmployerJobDetailResponse>> createEmployerJob(
            Principal principal,
            @Valid @RequestBody CreateEmployerJobRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                employerJobService.createEmployerJob(principal.getName(), request)
        ));
    }

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

    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<EmployerJobCommentResponse>>> getJobComments(
            Principal principal,
            @PathVariable Integer id
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                employerJobService.getJobComments(principal.getName(), id)
        ));
    }

    @GetMapping("/{id}/applicants")
    public ResponseEntity<ApiResponse<List<EmployerJobApplicantResponse>>> getJobApplicants(
            Principal principal,
            @PathVariable Integer id
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                employerJobService.getJobApplicants(principal.getName(), id)
        ));
    }

    @PostMapping(value = "/{id}/images", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<Void>> addJobImage(
            Principal principal,
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        var cloudinaryResponse = cloudinaryService.uploadFile(file, "job_posts");
        employerJobService.addJobImage(principal.getName(), id, cloudinaryResponse.getUrl());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deleteJobImage(
            Principal principal,
            @PathVariable Integer id,
            @PathVariable Integer imageId
    ) {
        employerJobService.deleteJobImage(principal.getName(), id, imageId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> patchJobStatus(
            Principal principal,
            @PathVariable Integer id,
            @RequestBody java.util.Map<String, String> body
    ) {
        tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus status = 
                tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus.valueOf(body.get("status"));
        employerJobService.patchJobStatus(principal.getName(), id, status);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteJob(
            Principal principal,
            @PathVariable Integer id
    ) {
        employerJobService.deleteJob(principal.getName(), id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

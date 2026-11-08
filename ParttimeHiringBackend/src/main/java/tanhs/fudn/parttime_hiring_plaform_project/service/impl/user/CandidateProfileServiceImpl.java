package tanhs.fudn.parttime_hiring_plaform_project.service.impl.user;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.multipart.MultipartFile;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.CandidateProfileRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.CandidateProfileResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.CandidateProfile;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.ApplicationStatus;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.exception.ResourceNotFoundException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.CandidateProfileMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.CandidateProfileRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.JobApplicationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.CandidateProfileService;

@Service @RequiredArgsConstructor @Slf4j
public class CandidateProfileServiceImpl implements CandidateProfileService {
    private final UserRepository users;
    private final CandidateProfileRepository profiles;
    private final JobApplicationRepository applications;
    private final CandidateProfileMapper mapper;

    // Returns profile metadata without disclosing document content in JSON.
    @Transactional(readOnly = true)
    public CandidateProfileResponse get(String username) { return mapper.toResponse(owned(username, false)); }

    // Serializes updates to profile text while preserving the private document.
    @Transactional
    public CandidateProfileResponse update(String username, CandidateProfileRequest request) {
        var profile = owned(username, true);
        mapper.update(request, profile);
        return mapper.toResponse(profiles.save(profile));
    }

    // Stores only bounded PDF-like documents, served as private attachments.
    @Transactional
    public CandidateProfileResponse upload(String username, MultipartFile file) {
        var profile = owned(username, true);
        if (file == null || file.isEmpty() || file.getSize() > 5 * 1024 * 1024) {
            throw new BusinessException("CV must be a PDF up to 5 MB");
        }
        try {
            byte[] bytes = file.getBytes();
            String header = new String(bytes, 0, Math.min(5, bytes.length), StandardCharsets.US_ASCII);
            String tail = new String(bytes, Math.max(0, bytes.length - 1024), Math.min(1024, bytes.length), StandardCharsets.US_ASCII);
            if (!header.equals("%PDF-") || !tail.contains("%%EOF")) throw new BusinessException("Invalid PDF document");
            profile.setResumeData(bytes); profile.setResumeFileName("resume.pdf");
            return mapper.toResponse(profiles.save(profile));
        } catch (IOException exception) { throw new BusinessException("Cannot read CV document"); }
    }

    // Downloads a private attachment for its owner.
    @Transactional(readOnly = true)
    public byte[] resume(String username) { return document(owned(username, false)); }

    // Shares current candidate details only through a nonwithdrawn application.
    @Transactional(readOnly = true)
    public CandidateProfileResponse applicationProfile(String username, Integer applicationId) {
        return mapper.toResponse(shared(username, applicationId));
    }

    // Downloads the current CV only for an authorized application participant.
    @Transactional(readOnly = true)
    public byte[] applicationResume(String username, Integer applicationId) { return document(shared(username, applicationId)); }

    // Finds or initializes a profile without trusting client-supplied ownership.
    private CandidateProfile owned(String username, boolean lock) {
        var user = (lock ? users.lockByUsername(username) : users.findByUsername(username))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return profiles.findByUser_Id(user.getId()).orElseGet(() -> mapper.create(user));
    }

    // Checks immutable candidate and employer ownership before exposing documents.
    private CandidateProfile shared(String username, Integer applicationId) {
        var actor = users.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        var application = applications.findById(applicationId).orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        boolean candidate = application.getApplicant().getId().equals(actor.getId());
        boolean employer = application.getJobPost().getEmployer().getUserId().longValue() == actor.getId();
        if (!candidate && (!employer || application.getStatus() == ApplicationStatus.WITHDRAWN)) {
            throw new AccessDeniedException("Candidate profile is private");
        }
        return profiles.findByUser_Id(application.getApplicant().getId())
                .orElseGet(() -> mapper.create(application.getApplicant()));
    }

    // Returns document bytes only when a CV has actually been uploaded.
    private byte[] document(CandidateProfile profile) {
        if (profile.getResumeData() == null) throw new ResourceNotFoundException("No CV uploaded");
        return profile.getResumeData();
    }
}

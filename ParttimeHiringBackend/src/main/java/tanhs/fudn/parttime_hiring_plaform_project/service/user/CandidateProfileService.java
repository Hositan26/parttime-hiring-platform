package tanhs.fudn.parttime_hiring_plaform_project.service.user;

import org.springframework.web.multipart.MultipartFile;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.CandidateProfileRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.CandidateProfileResponse;

public interface CandidateProfileService {
    // Reads the current account's candidate profile.
    CandidateProfileResponse get(String username);
    // Updates validated candidate experience and skills.
    CandidateProfileResponse update(String username, CandidateProfileRequest request);
    // Stores a bounded PDF document in private application storage.
    CandidateProfileResponse upload(String username, MultipartFile file);
    // Downloads only the authenticated account's private document.
    byte[] resume(String username);
    // Reads a profile shared through an application with its actual employer.
    CandidateProfileResponse applicationProfile(String username, Integer applicationId);
    // Downloads an application participant's shared document.
    byte[] applicationResume(String username, Integer applicationId);
}

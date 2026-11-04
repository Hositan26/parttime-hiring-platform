package tanhs.fudn.parttime_hiring_plaform_project.service.impl.user;

import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.job.JobPostResponse;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.exception.ResourceNotFoundException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.JobMapper;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.SavedJobMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.SavedJobRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.job.JobAvailabilityPolicy;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.SavedJobService;

@Service @RequiredArgsConstructor @Slf4j
public class SavedJobServiceImpl implements SavedJobService {
    private final UserRepository users;
    private final JobPostRepository jobs;
    private final SavedJobRepository saved;
    private final JobMapper jobsMapper;
    private final SavedJobMapper savedMapper;
    private final JobAvailabilityPolicy availability;

    // Returns a bounded account-owned list, retaining jobs that closed after saving.
    @Transactional(readOnly = true)
    public Page<JobPostResponse> list(String username, int page, int size) {
        if (page < 0 || size < 1 || size > 50) throw new BusinessException("Invalid page bounds");
        var user = users.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return saved.findByUser_Id(user.getId(), PageRequest.of(page, size, Sort.by("id").descending()))
                .map(entry -> jobsMapper.toJobPostResponse(entry.getJobPost()));
    }

    // Locks account-level saves so repeated requests cannot create duplicates.
    @Transactional
    public void save(String username, Integer jobId) {
        var user = users.lockByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        var job = jobs.findById(jobId).orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        if (!availability.isAvailable(job, LocalDateTime.now())) throw new BusinessException("Job is unavailable");
        if (!saved.existsByUser_IdAndJobPost_JobPostId(user.getId(), jobId)) {
            saved.save(savedMapper.create(user, job));
        }
    }

    // Deletes a saved job using the authenticated owner's identifier.
    @Transactional
    public void remove(String username, Integer jobId) {
        var user = users.lockByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        saved.deleteByUser_IdAndJobPost_JobPostId(user.getId(), jobId);
    }
}

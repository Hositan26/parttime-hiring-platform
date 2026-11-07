package tanhs.fudn.parttime_hiring_plaform_project.service.impl.admin;

import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminEmployerService;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.employer.AdminEmployerResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmployerStatus;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.AdminEmployerMapper;
import tanhs.fudn.parttime_hiring_plaform_project.exception.ResourceNotFoundException;

@Service @RequiredArgsConstructor @Slf4j
@Transactional(readOnly = true)
public class AdminEmployerServiceImpl implements AdminEmployerService {
    private final EmployerRepository employerRepository;
    private final UserRepository userRepository;
    private final AdminEmployerMapper mapper;

    // Searches company names before applying bounded account pagination.
    public Page<AdminEmployerResponse> getAllEmployers(int page, int size, String query) {
        if (page < 0 || size < 1 || size > 50) throw new IllegalArgumentException("Invalid pagination");
        return employerRepository.findByCompanyNameContainingIgnoreCase(query == null ? "" : query.trim(),
                PageRequest.of(page, size, Sort.by("employerId").descending())).map(this::response);
    }

    // Changes business standing without deleting recruitment or employment history.
    @Transactional
    public AdminEmployerResponse updateEmployerStatus(Integer employerId, EmployerStatus status) {
        Employer employer = employerRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found"));
        if (status == null || (status != EmployerStatus.ACTIVE && status != EmployerStatus.SUSPENDED)) {
            throw new IllegalArgumentException("Choose ACTIVE or SUSPENDED");
        }
        if (employer.getStatus() == EmployerStatus.PENDING_VERIFICATION) {
            throw new BusinessException("Review verification documents first");
        }
        employer.setStatus(status);
        return response(employerRepository.save(employer));
    }

    // Maps account login state independently from business standing.
    private AdminEmployerResponse response(Employer employer) {
        return mapper.toResponse(employer, userRepository.findById(employer.getUserId().longValue())
                .orElseThrow(() -> new ResourceNotFoundException("Employer account not found")));
    }
}

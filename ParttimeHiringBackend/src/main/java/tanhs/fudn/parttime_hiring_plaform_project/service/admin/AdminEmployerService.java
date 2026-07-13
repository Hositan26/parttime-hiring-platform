package tanhs.fudn.parttime_hiring_plaform_project.service.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import tanhs.fudn.parttime_hiring_plaform_project.dto.admin.employer.AdminEmployerResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmployerStatus;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;

@Service
@RequiredArgsConstructor
public class AdminEmployerService {

    private final EmployerRepository employerRepository;
    private final UserRepository userRepository;

    public Page<AdminEmployerResponse> getAllEmployers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "employerId"));
        Page<Employer> employers = employerRepository.findAll(pageable);

        return employers.map(employer -> {
            String username = userRepository.findById(employer.getUserId().longValue())
                    .map(User::getUsername).orElse("N/A");
            return AdminEmployerResponse.builder()
                .employerId(employer.getEmployerId())
                .companyName(employer.getCompanyName())
                .representativeName(employer.getRepresentativeName())
                .emailContact(employer.getEmailContact())
                .phoneContact(employer.getPhoneContact())
                .website(employer.getWebsite())
                .status(employer.getStatus())
                .userId(employer.getUserId().longValue())
                .username(username)
                .build();
        });
    }

    public AdminEmployerResponse updateEmployerStatus(Integer employerId, EmployerStatus status) {
        Employer employer = employerRepository.findById(employerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Employer"));
        employer.setStatus(status);
        employerRepository.save(employer);
        
        String username = userRepository.findById(employer.getUserId().longValue())
                .map(User::getUsername).orElse("N/A");
                
        return AdminEmployerResponse.builder()
                .employerId(employer.getEmployerId())
                .companyName(employer.getCompanyName())
                .representativeName(employer.getRepresentativeName())
                .emailContact(employer.getEmailContact())
                .phoneContact(employer.getPhoneContact())
                .website(employer.getWebsite())
                .status(employer.getStatus())
                .userId(employer.getUserId().longValue())
                .username(username)
                .build();
    }
}

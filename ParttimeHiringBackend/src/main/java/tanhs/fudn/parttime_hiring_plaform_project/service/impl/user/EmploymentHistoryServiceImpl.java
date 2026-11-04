package tanhs.fudn.parttime_hiring_plaform_project.service.impl.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.EmploymentHistoryResponse;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.exception.ResourceNotFoundException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.EmploymentHistoryMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employment.EmploymentRecordRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.EmploymentHistoryService;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmploymentHistoryServiceImpl implements EmploymentHistoryService {
    private final UserRepository users;
    private final EmploymentRecordRepository records;
    private final EmploymentHistoryMapper mapper;

    // Bounds history queries and derives ownership from the authenticated account.
    @Transactional(readOnly = true)
    public Page<EmploymentHistoryResponse> history(String username, int page, int size) {
        if (page < 0 || size < 1 || size > 50) throw new BusinessException("Invalid page bounds");
        var user = users.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return records.findByUser_Id(user.getId(), PageRequest.of(page, size,
                Sort.by("employmentRecordId").descending())).map(mapper::toResponse);
    }
}

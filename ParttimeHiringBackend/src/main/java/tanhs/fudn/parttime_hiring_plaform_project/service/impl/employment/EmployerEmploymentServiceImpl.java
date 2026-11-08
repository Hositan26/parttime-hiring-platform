package tanhs.fudn.parttime_hiring_plaform_project.service.impl.employment;

import org.springframework.security.access.AccessDeniedException;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.exception.ResourceNotFoundException;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.StoreRepository;

import tanhs.fudn.parttime_hiring_plaform_project.service.employment.EmployerEmploymentService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.UpdateEmploymentStatusRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.EmployerEmploymentResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employment.EmploymentRecord;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.WorkStatus;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.EmploymentRecordMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employment.EmploymentRecordRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployerEmploymentServiceImpl implements EmployerEmploymentService {

    private final EmploymentRecordRepository employmentRecordRepository;
    private final EmployerRepository employerRepository;
    private final UserRepository userRepository;
    private final EmploymentRecordMapper employmentRecordMapper;
    private final StoreRepository storeRepository;

    private Employer verifyEmployer(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return employerRepository.findByUserId(user.getId().intValue())
                .orElseThrow(() -> new RuntimeException("Chưa có hồ sơ nhà tuyển dụng"));
    }

    // Returns store employees only after validating the employer owns the store.
    @Transactional(readOnly = true)
    public List<EmployerEmploymentResponse> getEmploymentsByStore(Integer storeId, String username) {
        Employer employer = verifyEmployer(username);
        var store = storeRepository.findById(storeId).orElseThrow(() -> new ResourceNotFoundException("Store not found"));
        if (!store.getEmployer().getEmployerId().equals(employer.getEmployerId())) {
            throw new AccessDeniedException("You do not own this store");
        }
        return employmentRecordRepository.findByStoreIdWithDetails(storeId)
                .stream()
                .map(employmentRecordMapper::toEmployerEmploymentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EmployerEmploymentResponse> getAllEmployments(String username) {
        Employer employer = verifyEmployer(username);
        return employmentRecordRepository.findByEmployerIdWithDetails(employer.getEmployerId()).stream()
                .map(employmentRecordMapper::toEmployerEmploymentResponse)
                .collect(Collectors.toList());
    }

    // Records employment termination only for the owning employer.
    @Transactional
    public void updateEmploymentStatus(Integer recordId, UpdateEmploymentStatusRequest request, String username) {
        Employer employer = verifyEmployer(username);
        EmploymentRecord record = employmentRecordRepository.lockById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ nhân sự"));

        if (!record.getStore().getEmployer().getEmployerId().equals(employer.getEmployerId())) {
            throw new AccessDeniedException("Bạn không có quyền cập nhật nhân sự này");
        }

        WorkStatus status = request.getStatus();
        if (record.getWorkStatus() != WorkStatus.WORKING) {
            throw new BusinessException("Chỉ có thể kết thúc hồ sơ đang làm việc.");
        }
        if (status != WorkStatus.QUIT && status != WorkStatus.TERMINATED) {
            throw new BusinessException("Trạng thái kết thúc không hợp lệ.");
        }
        String reason = request.getNote();
        if (reason == null || reason.isBlank()) {
            throw new BusinessException("Vui lòng nhập lý do nghỉ việc hoặc sa thải.");
        }
        LocalDate today = LocalDate.now();
        if (record.getStartDate() != null && today.isBefore(record.getStartDate())) {
            throw new BusinessException("Ngày kết thúc không được trước ngày bắt đầu.");
        }
        record.setWorkStatus(status);
        record.setEndDate(today);
        record.setNote(reason.strip());
        employmentRecordRepository.save(record);
    }
}

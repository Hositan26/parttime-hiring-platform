package tanhs.fudn.parttime_hiring_plaform_project.service.employment;

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
public class EmployerEmploymentService {

    private final EmploymentRecordRepository employmentRecordRepository;
    private final EmployerRepository employerRepository;
    private final UserRepository userRepository;
    private final EmploymentRecordMapper employmentRecordMapper;

    private Employer verifyEmployer(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return employerRepository.findByUserId(user.getId().intValue())
                .orElseThrow(() -> new RuntimeException("Chưa có hồ sơ nhà tuyển dụng"));
    }

    @Transactional(readOnly = true)
    public List<EmployerEmploymentResponse> getEmploymentsByStore(Integer storeId, String username) {
        verifyEmployer(username);
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

    @Transactional
    public void updateEmploymentStatus(Integer recordId, UpdateEmploymentStatusRequest request, String username) {
        Employer employer = verifyEmployer(username);
        EmploymentRecord record = employmentRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ nhân sự"));

        if (!record.getStore().getEmployer().getEmployerId().equals(employer.getEmployerId())) {
            throw new RuntimeException("Bạn không có quyền cập nhật nhân sự này");
        }

        try {
            WorkStatus status = request.getStatus();
            
            // Validate transition
            if (record.getWorkStatus() == WorkStatus.QUIT || record.getWorkStatus() == WorkStatus.TERMINATED) {
                throw new RuntimeException("Không thể cập nhật nhân viên đã nghỉ hoặc bị sa thải");
            }
            if (status == WorkStatus.WORKING) {
                throw new RuntimeException("Nhân sự đang ở trạng thái làm việc");
            }
            if ((status == WorkStatus.QUIT || status == WorkStatus.TERMINATED) && 
                (request.getNote() == null || request.getNote().trim().isEmpty())) {
                throw new RuntimeException("Vui lòng cung cấp lý do (note) khi nghỉ việc hoặc sa thải");
            }

            record.setWorkStatus(status);
            record.setEndDate(LocalDate.now());
            record.setNote(request.getNote());

            employmentRecordRepository.save(record);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái không hợp lệ");
        }
    }
}

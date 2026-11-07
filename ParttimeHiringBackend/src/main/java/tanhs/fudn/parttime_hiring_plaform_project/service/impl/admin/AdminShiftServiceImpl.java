package tanhs.fudn.parttime_hiring_plaform_project.service.impl.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.admin.ShiftRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.ShiftResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.WorkShift;
import tanhs.fudn.parttime_hiring_plaform_project.exception.ResourceNotFoundException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.WorkShiftMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.WorkShiftRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminShiftService;

@Service
@RequiredArgsConstructor
public class AdminShiftServiceImpl implements AdminShiftService {

    private final WorkShiftRepository shiftRepository;
    private final WorkShiftMapper shiftMapper;
    private final tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository jobs;

    // Searches catalog names with bounded pagination.
    @Override
    @Transactional(readOnly = true)
    public Page<ShiftResponse> getShifts(int page, int size, String query) {
        if (page < 0 || size < 1 || size > 50) throw new IllegalArgumentException("Invalid pagination");
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "shiftId"));
        return shiftRepository.findByShiftNameContainingIgnoreCase(query == null ? "" : query.trim(), pageable).map(shiftMapper::toResponse);
    }

    // Creates a validated catalog entry without duplicate names.
    @Override
    @Transactional
    public ShiftResponse createShift(ShiftRequest request) {
        validate(request, null);
        WorkShift shift = shiftMapper.toEntity(request);
        shift.setSortOrder(0);
        shift.setIsActive(true);
        if (shift.getIsFlexible() == null) {
            shift.setIsFlexible(false);
        }
        WorkShift saved = shiftRepository.save(shift);
        return shiftMapper.toResponse(saved);
    }

    // Updates a validated catalog entry while preserving references.
    @Override
    @Transactional
    public ShiftResponse updateShift(Integer id, ShiftRequest request) {
        WorkShift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ca làm việc với id: " + id));
        
        validate(request, id);
        shiftMapper.updateEntity(shift, request);
        
        WorkShift updated = shiftRepository.save(shift);
        return shiftMapper.toResponse(updated);
    }

    // Deletes catalog entries only when no job uses them.
    @Override
    @Transactional
    public void deleteShift(Integer id) {
        if (!shiftRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy ca làm việc để xóa");
        }
        if (jobs.existsByShifts_ShiftId(id)) {
            throw new tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException("Shift is used by job listings");
        }
        shiftRepository.deleteById(id);
    }
    // Accepts overnight shifts but rejects missing or equal start and end times.
    private void validate(ShiftRequest request, Integer id) {
        if (request.getShiftName() == null || request.getShiftName().isBlank()) {
            throw new IllegalArgumentException("Shift name is required");
        }
        request.setShiftName(request.getShiftName().trim());
        if (request.getStartTime() == null || request.getEndTime() == null || request.getStartTime().equals(request.getEndTime())) {
            throw new IllegalArgumentException("Choose distinct start and end times");
        }
        if (shiftRepository.findByShiftNameIgnoreCase(request.getShiftName())
                .map(value -> !value.getShiftId().equals(id)).orElse(false)) {
            throw new tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException("Shift name already exists");
        }
    }
}

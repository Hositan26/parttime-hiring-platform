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

    /**
     * Lấy danh sách ca làm việc có phân trang
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ShiftResponse> getShifts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "shiftId"));
        return shiftRepository.findAll(pageable).map(shiftMapper::toResponse);
    }

    /**
     * Tạo mới ca làm việc
     */
    @Override
    @Transactional
    public ShiftResponse createShift(ShiftRequest request) {
        WorkShift shift = shiftMapper.toEntity(request);
        if (shift.getIsFlexible() == null) {
            shift.setIsFlexible(false);
        }
        WorkShift saved = shiftRepository.save(shift);
        return shiftMapper.toResponse(saved);
    }

    /**
     * Cập nhật thông tin ca làm việc
     */
    @Override
    @Transactional
    public ShiftResponse updateShift(Integer id, ShiftRequest request) {
        WorkShift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ca làm việc với id: " + id));
        
        shiftMapper.updateEntity(shift, request);
        
        WorkShift updated = shiftRepository.save(shift);
        return shiftMapper.toResponse(updated);
    }

    /**
     * Xóa ca làm việc theo ID
     */
    @Override
    @Transactional
    public void deleteShift(Integer id) {
        if (!shiftRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy ca làm việc để xóa");
        }
        shiftRepository.deleteById(id);
    }
}

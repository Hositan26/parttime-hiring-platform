package tanhs.fudn.parttime_hiring_plaform_project.controller.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.WorkShift;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.WorkShiftRepository;

@RestController
@RequestMapping("/api/v1/admin/shifts")
@RequiredArgsConstructor
public class AdminShiftController {

    private final WorkShiftRepository shiftRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<WorkShift>>> getShifts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "shiftId"));
        Page<WorkShift> shifts = shiftRepository.findAll(pageable);
        return ResponseEntity.ok(ApiResponse.success(shifts));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<WorkShift>> createShift(@RequestBody WorkShift shift) {
        if (shift.getIsFlexible() == null) shift.setIsFlexible(false);
        WorkShift saved = shiftRepository.save(shift);
        return ResponseEntity.ok(ApiResponse.success(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<WorkShift>> updateShift(@PathVariable Integer id, @RequestBody WorkShift shiftDetails) {
        WorkShift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ca làm việc"));
        shift.setShiftName(shiftDetails.getShiftName());
        shift.setStartTime(shiftDetails.getStartTime());
        shift.setEndTime(shiftDetails.getEndTime());
        shift.setIsFlexible(shiftDetails.getIsFlexible());
        WorkShift updated = shiftRepository.save(shift);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteShift(@PathVariable Integer id) {
        shiftRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

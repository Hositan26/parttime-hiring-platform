package tanhs.fudn.parttime_hiring_plaform_project.service.admin;

import org.springframework.data.domain.Page;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.admin.ShiftRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.ShiftResponse;

public interface AdminShiftService {
    // Searches shift names before pagination.
    Page<ShiftResponse> getShifts(int page, int size, String query);
    // Preserves the existing shift listing contract.
    default Page<ShiftResponse> getShifts(int page, int size) {
        return getShifts(page, size, "");
    }
    ShiftResponse createShift(ShiftRequest request);
    ShiftResponse updateShift(Integer id, ShiftRequest request);
    void deleteShift(Integer id);
}

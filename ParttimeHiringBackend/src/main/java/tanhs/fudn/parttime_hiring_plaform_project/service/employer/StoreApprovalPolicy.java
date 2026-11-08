package tanhs.fudn.parttime_hiring_plaform_project.service.employer;

import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;

public final class StoreApprovalPolicy {
    // Prevents construction of the store approval rules.
    private StoreApprovalPolicy() {
    }

    // Recognizes approved stores and previously active legacy records.
    public static boolean isApproved(Store store) {
        if (store.getIsApproved() == null) {
            return Boolean.TRUE.equals(store.getIsActive());
        }
        return store.getIsApproved();
    }

    // Allows a business to toggle only stores approved by administration.
    public static void toggleActivity(Store store) {
        if (!isApproved(store)) {
            throw new BusinessException("Cửa hàng cần được quản trị viên phê duyệt.");
        }
        store.setIsApproved(true);
        store.setIsActive(!Boolean.TRUE.equals(store.getIsActive()));
    }

    // Distinguishes pending approval from a paused approved store.
    public static String status(Store store) {
        if (!isApproved(store)) {
            return "PENDING";
        }
        return Boolean.TRUE.equals(store.getIsActive()) ? "ACTIVE" : "PAUSED";
    }
}

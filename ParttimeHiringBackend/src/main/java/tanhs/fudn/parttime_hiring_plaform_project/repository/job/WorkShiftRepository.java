package tanhs.fudn.parttime_hiring_plaform_project.repository.job;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.WorkShift;

@Repository
public interface WorkShiftRepository extends JpaRepository<WorkShift, Integer> {
    // Searches shift names before applying catalog pagination.
    Page<WorkShift> findByShiftNameContainingIgnoreCase(String query, Pageable pageable);
    // Detects duplicate names independently from letter casing.
    java.util.Optional<WorkShift> findByShiftNameIgnoreCase(String name);
}


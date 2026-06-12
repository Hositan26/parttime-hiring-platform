package tanhs.fudn.parttime_hiring_plaform_project.repository.application;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.JobApplication;

import java.time.LocalDateTime;
import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Integer> {
    
    @Query("SELECT COUNT(ja) FROM JobApplication ja WHERE ja.jobPost.employer.employerId = :employerId")
    long countByEmployerId(@Param("employerId") Integer employerId);

    @Query("SELECT COUNT(ja) FROM JobApplication ja WHERE ja.jobPost.store.storeId = :storeId")
    long countByStoreId(@Param("storeId") Integer storeId);

    @Query("SELECT COUNT(ja) FROM JobApplication ja WHERE ja.jobPost.employer.employerId = :employerId AND ja.status = :status")
    long countByEmployerIdAndStatus(@Param("employerId") Integer employerId, @Param("status") String status);

    @Query("SELECT ja FROM JobApplication ja JOIN FETCH ja.jobPost jp JOIN FETCH ja.applicant u WHERE jp.employer.employerId = :employerId ORDER BY ja.appliedAt DESC")
    List<JobApplication> findRecentApplicationsByEmployerId(@Param("employerId") Integer employerId, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT EXTRACT(MONTH FROM ja.appliedAt) as month, COUNT(ja) as count " +
           "FROM JobApplication ja WHERE ja.jobPost.employer.employerId = :employerId " +
           "AND ja.appliedAt >= :startDate " +
           "GROUP BY EXTRACT(MONTH FROM ja.appliedAt) " +
           "ORDER BY EXTRACT(MONTH FROM ja.appliedAt)")
    List<Object[]> countApplicationsByMonth(@Param("employerId") Integer employerId, @Param("startDate") LocalDateTime startDate);
}

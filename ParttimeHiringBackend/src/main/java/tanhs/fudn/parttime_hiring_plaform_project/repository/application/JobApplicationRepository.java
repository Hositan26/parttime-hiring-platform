package tanhs.fudn.parttime_hiring_plaform_project.repository.application;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.JobApplication;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.ApplicationStatus;

import java.time.LocalDateTime;
import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Integer> {
    
    @Query("SELECT COUNT(ja) FROM JobApplication ja WHERE ja.jobPost.employer.employerId = :employerId")
    long countByEmployerId(@Param("employerId") Integer employerId);

    @Query("SELECT COUNT(ja) FROM JobApplication ja WHERE ja.jobPost.store.storeId = :storeId")
    long countByStoreId(@Param("storeId") Integer storeId);

    long countByJobPost_JobPostId(Integer jobPostId);

    @Query("SELECT COUNT(ja) FROM JobApplication ja WHERE ja.jobPost.employer.employerId = :employerId AND ja.status = :status")
    long countByEmployerIdAndStatus(@Param("employerId") Integer employerId, @Param("status") ApplicationStatus status);

    @Query("SELECT ja FROM JobApplication ja JOIN FETCH ja.jobPost jp JOIN FETCH ja.applicant u WHERE jp.employer.employerId = :employerId ORDER BY ja.appliedAt DESC")
    List<JobApplication> findRecentApplicationsByEmployerId(@Param("employerId") Integer employerId, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT EXTRACT(MONTH FROM ja.appliedAt) as month, COUNT(ja) as count " +
           "FROM JobApplication ja WHERE ja.jobPost.employer.employerId = :employerId " +
           "AND ja.appliedAt >= :startDate " +
           "GROUP BY EXTRACT(MONTH FROM ja.appliedAt) " +
           "ORDER BY EXTRACT(MONTH FROM ja.appliedAt)")
    List<Object[]> countApplicationsByMonth(@Param("employerId") Integer employerId, @Param("startDate") LocalDateTime startDate);

    boolean existsByJobPost_JobPostIdAndApplicant_Id(Integer jobPostId, Long applicantId);

    List<JobApplication> findByApplicant_IdOrderByAppliedAtDesc(Long applicantId);
    
    List<JobApplication> findByJobPost_JobPostIdOrderByAppliedAtDesc(Integer jobPostId);

    List<JobApplication> findByJobPost_Employer_EmployerIdOrderByAppliedAtDesc(Integer employerId);

    @Query("SELECT ja FROM JobApplication ja WHERE ja.jobPost.employer.employerId = :employerId " +
           "AND (:storeId IS NULL OR ja.jobPost.store.storeId = :storeId) " +
           "AND (:status IS NULL OR ja.status = :status) " +
           "ORDER BY ja.appliedAt DESC")
    List<JobApplication> findFilteredApplications(@Param("employerId") Integer employerId,
                                                  @Param("storeId") Integer storeId,
                                                  @Param("status") ApplicationStatus status);
}

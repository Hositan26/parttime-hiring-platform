package tanhs.fudn.parttime_hiring_plaform_project.repository.job;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;

@Repository
public interface JobPostRepository extends JpaRepository<JobPost, Integer>, JpaSpecificationExecutor<JobPost> {
    
    long countByEmployer_EmployerId(Integer employerId);
    long countByStore_StoreId(Integer storeId);
    java.util.List<JobPost> findByStore_StoreId(Integer storeId);

    @org.springframework.data.jpa.repository.Query("SELECT jp FROM JobPost jp WHERE jp.employer.employerId = :employerId AND jp.expiredAt > CURRENT_TIMESTAMP ORDER BY jp.expiredAt ASC")
    java.util.List<JobPost> findExpiringJobsByEmployerId(@org.springframework.data.repository.query.Param("employerId") Integer employerId, org.springframework.data.domain.Pageable pageable);
    
    org.springframework.data.domain.Page<JobPost> findByEmployer_EmployerId(Integer employerId, org.springframework.data.domain.Pageable pageable);

    @Modifying
    @Query("UPDATE JobPost j SET j.status = :status WHERE j.expiredAt < :now AND j.status != :status")
    int updateStatusForExpiredJobs(@Param("now") java.time.LocalDateTime now, @Param("status") tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus status);
}

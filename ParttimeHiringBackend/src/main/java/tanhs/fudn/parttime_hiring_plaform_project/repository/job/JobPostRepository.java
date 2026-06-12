package tanhs.fudn.parttime_hiring_plaform_project.repository.job;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;

@Repository
public interface JobPostRepository extends JpaRepository<JobPost, Integer>, JpaSpecificationExecutor<JobPost> {
    
    long countByEmployer_EmployerId(Integer employerId);
    long countByStore_StoreId(Integer storeId);

    @org.springframework.data.jpa.repository.Query("SELECT jp FROM JobPost jp WHERE jp.employer.employerId = :employerId AND jp.expiredAt > CURRENT_TIMESTAMP ORDER BY jp.expiredAt ASC")
    java.util.List<JobPost> findExpiringJobsByEmployerId(@org.springframework.data.repository.query.Param("employerId") Integer employerId, org.springframework.data.domain.Pageable pageable);
}

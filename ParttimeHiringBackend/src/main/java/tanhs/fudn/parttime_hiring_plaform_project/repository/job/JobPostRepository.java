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
    
    // Protects category assignments from catalog deletion.
    boolean existsByCategories_CategoryId(Integer categoryId);
    // Protects shift assignments from catalog deletion.
    boolean existsByShifts_ShiftId(Integer shiftId);

    // Searches titles with the exact backend publication state.
    @Query("select j from JobPost j where (:status is null or j.status = :status) and lower(j.title) like lower(concat('%', :query, '%'))")
    org.springframework.data.domain.Page<JobPost> searchAdministration(@Param("query") String query,
            @Param("status") tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus status,
            org.springframework.data.domain.Pageable pageable);

    long countByEmployer_EmployerId(Integer employerId);
    long countByStore_StoreId(Integer storeId);
    java.util.List<JobPost> findByStore_StoreId(Integer storeId);

    // Finds active listings at operating stores in deadline order.
    @org.springframework.data.jpa.repository.Query("SELECT jp FROM JobPost jp WHERE jp.employer.employerId = :employerId AND jp.status = tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus.ACTIVE AND jp.store.isActive = true AND jp.expiredAt > CURRENT_TIMESTAMP ORDER BY jp.expiredAt ASC")
    java.util.List<JobPost> findExpiringJobsByEmployerId(@org.springframework.data.repository.query.Param("employerId") Integer employerId, org.springframework.data.domain.Pageable pageable);
    
    org.springframework.data.domain.Page<JobPost> findByEmployer_EmployerId(Integer employerId, org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<JobPost> findByStatus(tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus status, org.springframework.data.domain.Pageable pageable);

    // Expires only active jobs whose deadline has arrived.
    @Modifying
    @Query("UPDATE JobPost j SET j.status = :status WHERE j.expiredAt <= :now AND j.status = :activeStatus")
    int updateStatusForExpiredJobs(@Param("now") java.time.LocalDateTime now, @Param("status") tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus status,
            @Param("activeStatus") tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus activeStatus);
}

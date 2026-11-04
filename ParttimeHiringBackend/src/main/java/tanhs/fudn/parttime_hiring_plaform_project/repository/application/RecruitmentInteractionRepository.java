package tanhs.fudn.parttime_hiring_plaform_project.repository.application;

import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.RecruitmentInteraction;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.InteractionKind;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.InteractionStatus;

public interface RecruitmentInteractionRepository extends JpaRepository<RecruitmentInteraction, Long> {
    // Lists private conversation entries for a previously authorized application.
    Page<RecruitmentInteraction> findByApplication_ApplicationId(Integer applicationId, Pageable pageable);
    // Lists a reporter's own submissions without disclosing other reporters.
    Page<RecruitmentInteraction> findByAuthor_IdAndKind(Long userId, InteractionKind kind, Pageable pageable);
    // Lists moderation reports for administrators.
    Page<RecruitmentInteraction> findByKind(InteractionKind kind, Pageable pageable);
    // Detects repeated unresolved reports for the same opportunity.
    boolean existsByAuthor_IdAndJobPost_JobPostIdAndKindAndStatus(Long userId, Integer jobId, InteractionKind kind, InteractionStatus status);
    // Serializes competing interview responses before changing appointment state.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from RecruitmentInteraction i where i.id = :id")
    Optional<RecruitmentInteraction> lockById(@Param("id") Long id);
}

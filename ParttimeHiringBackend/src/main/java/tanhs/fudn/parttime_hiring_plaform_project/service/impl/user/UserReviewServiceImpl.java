package tanhs.fudn.parttime_hiring_plaform_project.service.impl.user;

import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.ReviewRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.UserReviewResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employment.EmploymentRecord;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.exception.ResourceNotFoundException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.UserReviewMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employment.EmploymentRecordRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.review.StoreReviewRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.UserReviewService;

@Service @RequiredArgsConstructor @Slf4j
public class UserReviewServiceImpl implements UserReviewService {
    private final UserRepository users;
    private final EmploymentRecordRepository records;
    private final StoreReviewRepository reviews;
    private final UserReviewMapper mapper;

    // Reads only a review associated with the authenticated worker's history.
    @Transactional(readOnly = true)
    public UserReviewResponse get(String username, Integer employmentId) {
        ownedEmployment(username, employmentId, false);
        return reviews.findByEmploymentRecord_EmploymentRecordId(employmentId).map(mapper::toResponse).orElse(null);
    }

    // Serializes review creation and requires verified employment that has begun.
    @Transactional
    public UserReviewResponse save(String username, Integer employmentId, ReviewRequest request) {
        var record = ownedEmployment(username, employmentId, true);
        if (record.getVerifiedByEmployer() == null || record.getVerifiedAt() == null
                || record.getStartDate() == null || record.getStartDate().isAfter(LocalDate.now())) {
            throw new BusinessException("Only verified work experience can be reviewed");
        }
        var review = reviews.findByEmploymentRecord_EmploymentRecordId(employmentId)
                .orElseGet(() -> mapper.create(request, record, record.getUser()));
        mapper.update(request, review);
        return mapper.toResponse(reviews.save(review));
    }

    // Deletes only a review linked to the authenticated worker's history.
    @Transactional
    public void delete(String username, Integer employmentId) {
        ownedEmployment(username, employmentId, true);
        reviews.findByEmploymentRecord_EmploymentRecordId(employmentId).ifPresent(reviews::delete);
    }

    // Resolves employment ownership without trusting a client-supplied reviewer identifier.
    private EmploymentRecord ownedEmployment(String username, Integer employmentId, boolean lock) {
        var user = (lock ? users.lockByUsername(username) : users.findByUsername(username))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        var record = records.findById(employmentId).orElseThrow(() -> new ResourceNotFoundException("Employment not found"));
        if (!record.getUser().getId().equals(user.getId())) throw new AccessDeniedException("Employment belongs to another account");
        return record;
    }
}

package tanhs.fudn.parttime_hiring_plaform_project.user;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.security.access.AccessDeniedException;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.ReviewRequest;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employment.EmploymentRecord;
import tanhs.fudn.parttime_hiring_plaform_project.entity.review.StoreReview;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.ReviewStatus;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.UserReviewMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employment.EmploymentRecordRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.review.StoreReviewRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.user.UserReviewServiceImpl;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserReviewTest {
    // Rejects foreign or unverified employment and preserves moderation during edits.
    @Test
    void enforcesEmploymentOwnershipAndModeration() {
        UserRepository users = mock(UserRepository.class);
        EmploymentRecordRepository records = mock(EmploymentRecordRepository.class);
        StoreReviewRepository reviews = mock(StoreReviewRepository.class);
        var mapper = Mappers.getMapper(UserReviewMapper.class);
        var service = new UserReviewServiceImpl(users, records, reviews, mapper);
        User user = User.builder().id(1L).build();
        when(users.lockByUsername("candidate")).thenReturn(Optional.of(user));
        EmploymentRecord record = EmploymentRecord.builder().user(User.builder().id(2L).build()).build();
        when(records.findById(5)).thenReturn(Optional.of(record));
        ReviewRequest request = new ReviewRequest(); request.setRating(5); request.setComment("Updated review");
        assertThrows(AccessDeniedException.class, () -> service.save("candidate", 5, request));
        record.setUser(user);
        assertThrows(BusinessException.class, () -> service.save("candidate", 5, request));
        record.setStartDate(LocalDate.now()); record.setVerifiedAt(LocalDateTime.now());
        record.setVerifiedByEmployer(Employer.builder().employerId(3).build());
        StoreReview review = StoreReview.builder().reviewId(7).status(ReviewStatus.HIDDEN).build();
        when(reviews.findByEmploymentRecord_EmploymentRecordId(5)).thenReturn(Optional.of(review));
        when(reviews.save(review)).thenReturn(review);
        service.save("candidate", 5, request);
        assertEquals(ReviewStatus.HIDDEN, review.getStatus());
        assertEquals(5, review.getRating());
        assertEquals("Updated review", review.getComment());
    }
}

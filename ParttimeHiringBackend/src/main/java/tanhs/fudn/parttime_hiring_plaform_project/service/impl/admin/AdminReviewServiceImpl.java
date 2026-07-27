package tanhs.fudn.parttime_hiring_plaform_project.service.impl.admin;

import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminReviewService;


import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.review.AdminReviewResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.review.StoreReview;
import tanhs.fudn.parttime_hiring_plaform_project.repository.review.StoreReviewRepository;

@Service
@RequiredArgsConstructor
public class AdminReviewServiceImpl implements AdminReviewService {

    private final StoreReviewRepository reviewRepository;

    public Page<AdminReviewResponse> getAllReviews(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "reviewId"));
        Page<StoreReview> reviews = reviewRepository.findAll(pageable);
        
        return reviews.map(r -> AdminReviewResponse.builder()
                .reviewId(r.getReviewId())
                .storeName(r.getStore().getStoreName())
                .reviewerName(r.getReviewer().getDisplayName())
                .reviewerUsername(r.getReviewer().getUsername())
                .rating(r.getRating())
                .comment(r.getComment())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .build());
    }

    public void deleteReview(Integer id) {
        reviewRepository.deleteById(id);
    }
}

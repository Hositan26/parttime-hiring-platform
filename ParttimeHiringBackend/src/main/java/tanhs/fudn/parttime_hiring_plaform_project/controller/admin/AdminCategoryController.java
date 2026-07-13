package tanhs.fudn.parttime_hiring_plaform_project.controller.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobCategory;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobCategoryRepository;

@RestController
@RequestMapping("/api/v1/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final JobCategoryRepository categoryRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<JobCategory>>> getCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "categoryId"));
        Page<JobCategory> categories = categoryRepository.findAll(pageable);
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<JobCategory>> createCategory(@RequestBody JobCategory category) {
        // Simple slug generation
        category.setSlug(category.getCategoryName().toLowerCase().replaceAll("[^a-z0-9]", "-"));
        if (category.getIsActive() == null) category.setIsActive(true);
        JobCategory saved = categoryRepository.save(category);
        return ResponseEntity.ok(ApiResponse.success(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<JobCategory>> updateCategory(@PathVariable Integer id, @RequestBody JobCategory categoryDetails) {
        JobCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ngành nghề"));
        category.setCategoryName(categoryDetails.getCategoryName());
        category.setDescription(categoryDetails.getDescription());
        category.setIsActive(categoryDetails.getIsActive());
        category.setSlug(category.getCategoryName().toLowerCase().replaceAll("[^a-z0-9]", "-"));
        JobCategory updated = categoryRepository.save(category);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Integer id) {
        categoryRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

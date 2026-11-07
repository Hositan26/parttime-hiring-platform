package tanhs.fudn.parttime_hiring_plaform_project.service.impl.admin;

import lombok.extern.slf4j.Slf4j;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.admin.CategoryRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.CategoryResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobCategory;
import tanhs.fudn.parttime_hiring_plaform_project.exception.ResourceNotFoundException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.JobCategoryMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobCategoryRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminCategoryService;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminCategoryServiceImpl implements AdminCategoryService {

    private final JobCategoryRepository categoryRepository;
    private final JobCategoryMapper categoryMapper;
    private final JobPostRepository jobs;

    // Searches category names with bounded pagination.
    @Override
    @Transactional(readOnly = true)
    public Page<CategoryResponse> getCategories(int page, int size, String query) {
        if (page < 0 || size < 1 || size > 50) throw new IllegalArgumentException("Invalid pagination");
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "categoryId"));
        return categoryRepository.findByCategoryNameContainingIgnoreCase(query == null ? "" : query.trim(), pageable).map(categoryMapper::toResponse);
    }

    // Creates a validated catalog entry without duplicate names.
    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        validate(request, null);
        JobCategory category = categoryMapper.toEntity(request);
        category.setSortOrder(0);
        category.setSlug(generateSlug(request.getCategoryName()));
        if (category.getIsActive() == null) {
            category.setIsActive(true);
        }
        JobCategory saved = categoryRepository.save(category);
        return categoryMapper.toResponse(saved);
    }

    // Updates a validated catalog entry while preserving references.
    @Override
    @Transactional
    public CategoryResponse updateCategory(Integer id, CategoryRequest request) {
        JobCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ngành nghề với id: " + id));

        validate(request, id);
        categoryMapper.updateEntity(category, request);
        category.setSlug(generateSlug(request.getCategoryName()));

        JobCategory updated = categoryRepository.save(category);
        return categoryMapper.toResponse(updated);
    }

    // Deletes catalog entries only when no job uses them.
    @Override
    @Transactional
    public void deleteCategory(Integer id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy ngành nghề để xóa");
        }
        if (jobs.existsByCategories_CategoryId(id)) {
            throw new BusinessException("Category is used by job listings; deactivate it instead");
        }
        categoryRepository.deleteById(id);
    }

    // Validates normalized names and slug uniqueness before changing catalog data.
    private void validate(CategoryRequest request, Integer id) {
        if (request.getCategoryName() == null || request.getCategoryName().isBlank()) {
            throw new IllegalArgumentException("Category name is required");
        }
        request.setCategoryName(request.getCategoryName().trim());
        String slug = generateSlug(request.getCategoryName());
        if (slug.isBlank()) throw new IllegalArgumentException("Category name must contain letters or digits");
        boolean nameConflict = categoryRepository.findByCategoryNameIgnoreCase(request.getCategoryName())
                .map(value -> !value.getCategoryId().equals(id)).orElse(false);
        boolean slugConflict = categoryRepository.findBySlug(slug)
                .map(value -> !value.getCategoryId().equals(id)).orElse(false);
        if (nameConflict || slugConflict) throw new BusinessException("Category name or slug already exists");
    }

    // Normalizes Vietnamese names into stable URL-safe category slugs.
    private String generateSlug(String name) {
        return java.text.Normalizer.normalize(name.toLowerCase(java.util.Locale.ROOT).replace('đ', 'd'), java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "").replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }
}

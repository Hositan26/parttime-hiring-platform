package tanhs.fudn.parttime_hiring_plaform_project.service.impl.admin;

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

@Service
@RequiredArgsConstructor
public class AdminCategoryServiceImpl implements AdminCategoryService {

    private final JobCategoryRepository categoryRepository;
    private final JobCategoryMapper categoryMapper;

    /**
     * Lấy danh sách ngành nghề có phân trang
     */
    @Override
    @Transactional(readOnly = true)
    public Page<CategoryResponse> getCategories(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "categoryId"));
        return categoryRepository.findAll(pageable).map(categoryMapper::toResponse);
    }

    /**
     * Tạo mới ngành nghề, tự động tạo slug từ tên
     */
    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        JobCategory category = categoryMapper.toEntity(request);
        category.setSlug(generateSlug(request.getCategoryName()));
        if (category.getIsActive() == null) {
            category.setIsActive(true);
        }
        JobCategory saved = categoryRepository.save(category);
        return categoryMapper.toResponse(saved);
    }

    /**
     * Cập nhật thông tin ngành nghề
     */
    @Override
    @Transactional
    public CategoryResponse updateCategory(Integer id, CategoryRequest request) {
        JobCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ngành nghề với id: " + id));
        
        categoryMapper.updateEntity(category, request);
        category.setSlug(generateSlug(request.getCategoryName()));
        
        JobCategory updated = categoryRepository.save(category);
        return categoryMapper.toResponse(updated);
    }

    /**
     * Xóa ngành nghề theo ID
     */
    @Override
    @Transactional
    public void deleteCategory(Integer id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy ngành nghề để xóa");
        }
        categoryRepository.deleteById(id);
    }

    private String generateSlug(String name) {
        if (name == null) return "";
        return name.toLowerCase().replaceAll("[^a-z0-9]+", "-");
    }
}

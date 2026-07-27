package tanhs.fudn.parttime_hiring_plaform_project.service.admin;

import org.springframework.data.domain.Page;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.admin.CategoryRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.CategoryResponse;

public interface AdminCategoryService {
    Page<CategoryResponse> getCategories(int page, int size);
    CategoryResponse createCategory(CategoryRequest request);
    CategoryResponse updateCategory(Integer id, CategoryRequest request);
    void deleteCategory(Integer id);
}

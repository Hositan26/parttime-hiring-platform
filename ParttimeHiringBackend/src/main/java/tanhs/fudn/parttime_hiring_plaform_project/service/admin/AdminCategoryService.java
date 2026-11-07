package tanhs.fudn.parttime_hiring_plaform_project.service.admin;

import org.springframework.data.domain.Page;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.admin.CategoryRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.CategoryResponse;

public interface AdminCategoryService {
    // Searches categories before pagination.
    Page<CategoryResponse> getCategories(int page, int size, String query);
    // Preserves the existing catalog listing contract.
    default Page<CategoryResponse> getCategories(int page, int size) {
        return getCategories(page, size, "");
    }
    CategoryResponse createCategory(CategoryRequest request);
    CategoryResponse updateCategory(Integer id, CategoryRequest request);
    void deleteCategory(Integer id);
}

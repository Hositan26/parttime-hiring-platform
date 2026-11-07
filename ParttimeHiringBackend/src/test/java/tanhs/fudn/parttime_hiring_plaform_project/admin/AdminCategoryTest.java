package tanhs.fudn.parttime_hiring_plaform_project.admin;

import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import java.util.Optional;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobCategoryRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.JobCategoryMapper;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.admin.CategoryRequest;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobCategory;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.admin.AdminCategoryServiceImpl;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class AdminCategoryTest {
    // Normalizes Vietnamese slugs and prevents duplicate names or dependent deletion.
    @Test
    void validatesNamesSlugsAndReferencedCategories() {
        var repository = mock(JobCategoryRepository.class);
        var jobs = mock(JobPostRepository.class);
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        var service = new AdminCategoryServiceImpl(repository, Mappers.getMapper(JobCategoryMapper.class), jobs);
        var request = new CategoryRequest(); request.setCategoryName("  Đồ uống & Phục vụ  ");
        assertEquals("do-uong-phuc-vu", service.createCategory(request).getSlug());
        when(repository.findBySlug("do-uong-phuc-vu")).thenReturn(Optional.of(JobCategory.builder().categoryId(3).build()));
        assertThrows(BusinessException.class, () -> service.createCategory(request));
        when(repository.existsById(3)).thenReturn(true);
        when(jobs.existsByCategories_CategoryId(3)).thenReturn(true);
        assertThrows(BusinessException.class, () -> service.deleteCategory(3));
        verify(repository, never()).deleteById(3);
    }
}

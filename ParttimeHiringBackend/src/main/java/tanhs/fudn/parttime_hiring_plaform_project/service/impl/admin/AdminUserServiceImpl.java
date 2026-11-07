package tanhs.fudn.parttime_hiring_plaform_project.service.impl.admin;

import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RefreshSessionRepository;

import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminUserService;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.user.AdminUserResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.Role;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.core.context.SecurityContextHolder;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final RefreshSessionRepository sessions;

    private final tanhs.fudn.parttime_hiring_plaform_project.mapper.AdminUserMapper mapper;

    // Searches accounts with bounded pagination and optional activity filters.
    @Transactional(readOnly = true)
    public Page<AdminUserResponse> getAllUsers(int page, int size, String query, Boolean active) {
        if (page < 0 || size < 1 || size > 50) {
            throw new IllegalArgumentException("Invalid pagination");
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return userRepository.searchAdministration(query == null ? "" : query.trim(), active, pageable)
                .map(mapper::toAccountResponse);
    }

    // Disables the account and permanently invalidates existing credentials.
    @Override
    @Transactional
    public void banUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && user.getUsername().equals(authentication.getName())) {
            throw new BusinessException("You cannot disable your own account");
        }
        user.setIsActive(false);
        user.setAuthVersion(user.getAuthVersion() + 1);
        sessions.revokeUser(id);
        userRepository.save(user);
    }

    // Restores account access without reviving previously invalidated sessions.
    @Override
    @Transactional
    public void unbanUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsActive(true);
        userRepository.save(user);
    }
}

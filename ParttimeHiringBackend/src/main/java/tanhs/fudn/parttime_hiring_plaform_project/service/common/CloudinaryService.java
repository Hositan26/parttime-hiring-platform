package tanhs.fudn.parttime_hiring_plaform_project.service.common;

import tanhs.fudn.parttime_hiring_plaform_project.service.common.CloudinaryService;
import org.springframework.web.multipart.MultipartFile;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.CloudinaryResponse;
import java.io.IOException;

public interface CloudinaryService {
    CloudinaryResponse uploadFile(MultipartFile file, String folderName) throws java.io.IOException;
}
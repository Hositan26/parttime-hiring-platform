package tanhs.fudn.parttime_hiring_plaform_project.util;

import java.io.IOException;
import java.util.Locale;
import java.util.Set;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import org.springframework.web.multipart.MultipartFile;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;

public final class ImageUploads {
    // Prevents construction of a stateless image validation utility.
    private ImageUploads() { }
    // Checks actual JPEG/PNG content before bounded image decoding or external uploads.
    public static void validate(MultipartFile file) {
        if (file == null || file.isEmpty() || file.getSize() > 5 * 1024 * 1024) {
            throw new BusinessException("Image must be JPEG or PNG, up to 5 MB");
        }
        try (ImageInputStream input = ImageIO.createImageInputStream(file.getInputStream())) {
            if (input == null) throw new BusinessException("Invalid image");
            var readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) throw new BusinessException("Invalid JPEG or PNG image");
            ImageReader reader = readers.next();
            try {
                reader.setInput(input);
                if (!Set.of("jpeg", "png").contains(reader.getFormatName().toLowerCase(Locale.ROOT))
                        || reader.getWidth(0) > 4096 || reader.getHeight(0) > 4096 || reader.read(0) == null) {
                    throw new BusinessException("Images must not exceed 4096 pixels per dimension");
                }
            } finally { reader.dispose(); }
        } catch (IOException exception) { throw new BusinessException("Invalid image data"); }
    }
}

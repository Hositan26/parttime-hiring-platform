package tanhs.fudn.parttime_hiring_plaform_project.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

/**
 * Lớp tiện ích để tạo, xác thực và trích xuất thông tin từ JWT (JSON Web Token).
 */
@Component
public class JwtTokenProvider {

    @Value("${jwt.signerKey}")
    private String jwtSecret;

    @Value("${jwt.valid-duration}")
    private long jwtExpiration;

    /**
     * Lấy khóa bí mật để ký JWT.
     * @return Key đối tượng khóa bí mật.
     */
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * Tạo chuỗi JWT từ thông tin đăng nhập của người dùng.
     * @param authentication Đối tượng chứa thông tin xác thực.
     * @return Chuỗi JWT đã ký.
     */
    public String generateToken(Authentication authentication) {
        String username = authentication.getName();
        return generateTokenFromUsername(username);
    }

    /**
     * Tạo chuỗi JWT từ username (dùng cho OAuth2).
     */
    public String generateTokenFromUsername(String username) {
        Date currentDate = new Date();
        Date expireDate = new Date(currentDate.getTime() + (jwtExpiration * 1000));

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(currentDate)
                .setExpiration(expireDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Trích xuất username từ chuỗi JWT.
     * @param token Chuỗi JWT.
     * @return username (subject của JWT).
     */
    public String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    /**
     * Xác thực chuỗi JWT có hợp lệ hay không.
     * @param authToken Chuỗi JWT cần kiểm tra.
     * @return true nếu hợp lệ, false nếu không.
     */
    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            // Log lỗi nếu cần thiết (Hết hạn, sai chữ ký, token hỏng)
            System.err.println("Invalid JWT token: " + ex.getMessage());
        }
        return false;
    }
}

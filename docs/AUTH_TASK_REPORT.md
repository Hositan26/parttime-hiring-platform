# Báo cáo hoàn thành Authentication / Authorization

Ngày: 04/11/2026
Nhánh: `codex/authentication-authorization`

## Kết quả kiểm tra

| Kiểm tra | Kết quả |
|---|---|
| Backend trên Java 17 | 50 test đạt, 0 failure, 0 error |
| MySQL 8 trong Docker | 6 test vòng đời xác thực đạt trên database tạm riêng |
| Frontend unit test | 6 test đạt |
| Frontend production build | Đạt; còn cảnh báo bundle lớn |
| ESLint phần lõi AUTH mới/sửa | Đạt |
| ESLint toàn frontend | Còn 89 lỗi, 8 cảnh báo ở mã hiện có; không coi đây là kiểm tra đạt |
| Database dự án | Không dùng làm dữ liệu test; database MySQL tạm đã được xóa |

Bộ test backend sử dụng H2 riêng theo context và không phụ thuộc dữ liệu MySQL phát triển.
Một lượt kiểm thử riêng đã xác nhận đăng ký, đăng nhập, refresh, logout, thu hồi phiên,
reset mật khẩu và định danh tài khoản trên MySQL.

Google OAuth được kiểm thử ở ranh giới xử lý identity/callback bằng mock. Gửi SMTP và
Google consent/callback với tài khoản dịch vụ thật chưa được xác nhận tự động.
Không có kiểm thử tương tác trình duyệt trong lượt này.

## Task và commit

| Task | Nội dung triển khai | Bằng chứng kiểm thử | Commit |
|---|---|---|---|
| AUTH-01 | Kiểm tra username, mật khẩu, thông tin đăng ký và DTO mapping an toàn | RegistrationUnitTest; AuthLifecycleIntegrationTest | 4463506 |
| AUTH-02 | Đăng nhập và thông báo lỗi chung, không lộ exception nội bộ | LoginUnitTest; LoginTest | 25c10c0 |
| AUTH-03 | Google email đã xác minh, liên kết provider, chặn tài khoản khóa, callback không chứa token | OAuthUnitTest; OAuthSuccessUnitTest | ebde629 |
| AUTH-04 | Khóa ký, issuer, purpose, subject, hạn dùng và ID JWT | JwtUnitTest | 0a9c031 |
| AUTH-05 | Ba giao diện gọi logout server và xóa cookie | CookieUnitTest; AuthLifecycleIntegrationTest | 6aaf027 |
| AUTH-06 | Xử lý hết phiên và giữ đường dẫn nội bộ an toàn | auth-policy.test.mjs; api-client.test.mjs | 2e0e43f |
| AUTH-07 | Refresh token dạng băm, xoay token, khóa giao dịch và chống replay | RefreshUnitTest; AuthLifecycleIntegrationTest | cbc5b97 |
| AUTH-08 | Thu hồi access token, refresh family và phiên sau thay đổi bảo mật | RevocationUnitTest; AuthLifecycleIntegrationTest | 7eb060f |
| AUTH-09 | Quên/reset mật khẩu qua liên kết một lần, hết hạn sau 15 phút | PasswordResetUnitTest; AuthLifecycleIntegrationTest | af3a90f |
| AUTH-10 | Đổi mật khẩu sau xác nhận mật khẩu cũ, thu hồi phiên cũ | PasswordChangeUnitTest | 6b52f1e |
| AUTH-11 | Chặn JWT của tài khoản khóa và không khôi phục token cũ khi mở khóa | AccountLockUnitTest; AuthLifecycleIntegrationTest | 9776024 |
| AUTH-12 | Ràng buộc API theo USER/EMPLOYER/ADMIN | RoleAccessIntegrationTest; EmployerStatusUnitTest | ec755a8 |
| AUTH-13 | Kiểm tra chủ sở hữu cửa hàng/nhân sự và các thao tác doanh nghiệp | OwnershipUnitTest | b0af42c |
| AUTH-14 | AuthContext và route guard cho trang riêng, employer, admin | auth-policy.test.mjs; frontend build | 7ada228 |
| AUTH-15 | Duyệt hồ sơ tạo Employer nếu thiếu, cấp role và giữ quyền USER | EmployerGrantUnitTest | 582b82e |
| AUTH-16 | Lỗi JSON 401/403/400/409, không redirect HTML cho API | RoleAccessIntegrationTest; CsrfIntegrationTest | ca79026 |
| AUTH-17 | JWT dùng ID bất biến và phiên vẫn xác định đúng sau đổi username | StableIdentityUnitTest; AuthLifecycleIntegrationTest | 650eb9a |
| AUTH-18 | OTP ràng buộc tài khoản/email, lưu dạng băm, xác nhận thật và dùng một lần | OtpUnitTest; OtpPersistenceIntegrationTest | c5660f6 |
| AUTH-19 | Giới hạn thử đăng nhập/gửi email/OTP và kiểm tra yêu cầu đồng thời | RateLimitUnitTest | ea53050 |
| AUTH-20 | Cookie theo môi trường, CSRF, CORS và API base URL cấu hình | CookieUnitTest; CsrfIntegrationTest; api-client.test.mjs | a6e9c79 |
| AUTH-21 | Bộ test hồi quy, dữ liệu test độc lập, kiểm tra MySQL và tài liệu vận hành | 50 backend test; 6 frontend test; 6 lượt test MySQL | Commit chứa báo cáo này |

Commit AUTH-21 cũng chứa các điều chỉnh phát hiện trong kiểm tra cuối: giới hạn byte
mật khẩu BCrypt, khóa tài khoản khi xác thực/đổi mật khẩu, optimistic locking, kiểm tra
trạng thái doanh nghiệp khi ghi dữ liệu, kiểm tra quyền trước upload ảnh, dọn credential
hết hạn và đồng bộ URL API theo môi trường.

## Tài liệu và thay đổi khi chạy

- [API, quy tắc bảo mật và hướng dẫn kiểm thử](AUTHENTICATION.md).
- [SQL nâng cấp để review](../database/migrations/001_authentication.sql).
- Local Hibernate update bổ sung bảng/cột mới khi chạy profile local; không chạy lại
  SQL nâng cấp nếu các cột đã được Hibernate tạo.
- Các cookie/JWT cấp trước thay đổi định danh mới không được giữ tương thích; đăng nhập lại.
- Các API ghi dữ liệu cần cookie CSRF và header X-XSRF-TOKEN. Frontend đã xử lý tập trung.
- Profile local cho phép HTTP và tài khoản phát triển; cấu hình mặc định dùng Secure cookie
  và không tự tạo tài khoản admin/employer.
- Refresh replay vô hiệu hóa phiên tài khoản; nhiều tab xoay token đồng thời có thể cần
  đăng nhập lại.
- Giới hạn thử hiện dùng bộ nhớ một tiến trình. Cần shared storage nếu triển khai nhiều
  instance hoặc muốn giữ bộ đếm qua lần khởi động lại.
- Google không tự liên kết tài khoản local chỉ vì trùng email; điều này tránh liên kết
  dựa trên địa chỉ chưa được xác minh.
- SMTP/Google thật và kiểm thử trình duyệt là bước xác nhận tích hợp tiếp theo.
- Chưa push nhánh lên remote trong lượt làm việc này.

## Chạy lại

Backend:

```powershell
cd ParttimeHiringBackend
.\mvnw.cmd test '-Dbackend.build.directory=target/isolated-tests'
```

Frontend:

```powershell
cd ParttimeHiringFrontend
node --experimental-strip-types --test tests/*.test.mjs
npm run build
```

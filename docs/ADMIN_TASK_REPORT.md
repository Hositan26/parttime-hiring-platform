# Báo cáo nhóm ADMIN

Ngày: 07/11/2026. Nhánh: `feat/admin-features`.
Base đã xác nhận sau `git fetch origin dev`: `2c46a70` (Employer PR #3).
Chỉ commit local, không push, không merge vào dev.

## Kết quả tổng thể

| Kiểm tra | Kết quả |
| --- | --- |
| Backend toàn bộ | **129 test đạt**, 0 failure, 0 error, 0 skipped |
| Java | Chạy trên Java 21.0.11; biên dịch target Java 17 |
| Frontend toàn bộ tests | **12 test đạt** |
| Frontend production build | Đạt; còn cảnh báo chunk JS lớn hơn 500 kB |
| ESLint phần Admin | Đạt, 0 lỗi/cảnh báo trên pages/Admin, AdminLayout.tsx và services/admin*.ts |
| Git diff whitespace | Đạt |
| MySQL 8 migration 008 | Đạt trên schema tạm; bản ghi trước migration nhận moderation_blocked = 0 |
| Trình duyệt | Smoke test với backend H2 riêng, desktop và viewport 390 × 844 |

Toàn bộ backend tests dùng H2 riêng. Migration được thử trên schema
`parttime_admin_migration_20261107` trong container `mysql-parttime`, sau đó schema tạm đã được xóa.
Không dùng database nghiệp vụ để tạo, sửa hoặc xóa dữ liệu kiểm thử. Các tiến trình QA đã được dừng.
Không commit credential hoặc nội dung `.env`.

## Bảng task và commit

Các kiểm thử bổ sung xuyên luồng ở commit ADM-18 cũng kiểm chứng lại các task trước.

| Task | Kết quả triển khai | Bằng chứng kiểm thử chính | Commit local |
| --- | --- | --- | --- |
| ADM-01 | Kiểm tra đăng nhập/logout Admin, thu hồi cookie, chặn khách/USER/EMPLOYER; giữ AdminRoute | AuthLifecycleIntegrationTest; RoleAccessIntegrationTest; auth-policy.test.mjs; trình duyệt | `af719d7` |
| ADM-02 | Đếm đơn từ JobApplication; thêm hồ sơ doanh nghiệp, cửa hàng và báo cáo chờ bằng count query | AdminDashboardTest; AdminWorkflowIntegrationTest | `0cc0291` |
| ADM-03 | Tìm username/tên/email, lọc hoạt động, phân trang sau lọc; DTO qua MapStruct | AdminAccountSearchIntegrationTest; tìm email trên trình duyệt | `d66a726` |
| ADM-04 | Xác nhận khóa/mở khóa; chặn tự khóa ở service/UI; giữ thu hồi phiên khi khóa | AdminAccountSearchIntegrationTest; AuthLifecycleIntegrationTest; nút tự khóa disabled trên trình duyệt | `23ab5a3` |
| ADM-05 | Tìm tên doanh nghiệp; hiển thị riêng trạng thái doanh nghiệp và tài khoản | AdminEmployerSearchIntegrationTest | `2269cdd` |
| ADM-06 | Giới hạn thao tác ACTIVE/SUSPENDED; không dùng đổi trạng thái để bỏ qua hồ sơ chờ xác minh; giữ lịch sử | AdminEmployerSearchIntegrationTest; EmployerStatusUnitTest; JobAvailabilityPolicyTest | `d90ab29` |
| ADM-07 | Tìm công ty/MST theo trạng thái; xem thông tin và tài liệu; xử lý ảnh lỗi/tài liệu thiếu | AdminVerificationIntegrationTest | `90e52fc` |
| ADM-08 | Duyệt cấp Employer và giữ quyền cũ; từ chối bắt buộc lý do; User nhận lý do; không quyết định lại hồ sơ đã xử lý | AdminVerificationIntegrationTest; BusinessVerificationSubmissionTest; EmployerGrantUnitTest | `579723e` |
| ADM-09 | Tách API phê duyệt và hoạt động; công khai yêu cầu cả hai; giữ quy trình địa chỉ thay đổi cần duyệt lại | AdminStoreApprovalTest; EmployerStoreCreationIntegrationTest; EmployerStoreMaintenanceTest; JobAvailabilityPolicyTest | `89ee688` |
| ADM-10 | Tìm/lọc tên, hoạt động và phê duyệt; chỉ xóa cửa hàng không có tin/lịch sử việc làm | AdminStoreApprovalTest; AdminWorkflowIntegrationTest | `9c285b2` |
| ADM-11 | Tìm tiêu đề và trạng thái backend; sửa trường dữ liệu FE; xem chi tiết tin ở mọi trạng thái | AdminJobSearchTest; AdminWorkflowIntegrationTest | `d00734a` |
| ADM-12 | Gỡ PAUSED kèm cờ moderationBlocked; chặn Employer tự mở; mở lại có điều kiện; bảo vệ đơn/trao đổi/báo cáo/lượt lưu khi xóa | AdminJobSearchTest; EmployerJobPublicationTest; JobAvailabilityPolicyTest; AdminWorkflowIntegrationTest | `ebf85fe` |
| ADM-13 | Trang báo cáo trong Admin, lọc OPEN/RESOLVED; xem đúng tin qua API Admin; đánh dấu xử lý và giữ nội dung | AdminReportsTest; RoleAccessIntegrationTest | `b95c7c3` |
| ADM-14 | Tìm cửa hàng/người viết; ẩn và khôi phục đánh giá; giữ lịch sử việc làm | UserJourneyIntegrationTest kiểm tra User đọc trạng thái và Employer ẩn/hiện | `6e8a4a3` |
| ADM-15 | Tìm/thêm/sửa/xóa ngành nghề; slug tiếng Việt; kiểm tra tên/slug trùng và tin đang dùng | AdminCategoryTest; AdminWorkflowIntegrationTest; tạo ngành nghề trên trình duyệt | `5234033` |
| ADM-16 | Tìm/thêm/sửa/xóa ca; giờ bắt buộc khác nhau, cho phép qua đêm; bảo vệ ca đang dùng | AdminShiftTest; AdminWorkflowIntegrationTest | `fd0db97` |
| ADM-18 | Menu 7 nhóm và tab; responsive; tải/trống/lỗi; tái sử dụng hook hủy request cũ; validation; chuẩn hóa typing/import/comment; kiểm thử tổng thể | 129 backend tests; 12 frontend tests; build; Admin lint; browser smoke | `e5593e0` |

## Quyết định nghiệp vụ

1. **Khóa tài khoản và đình chỉ doanh nghiệp độc lập.** Khóa tài khoản thu hồi phiên như AUTH đã triển khai; mở khóa không hồi sinh cookie cũ. Đình chỉ doanh nghiệp giữ nguyên tài khoản, hồ sơ, đơn và lịch sử việc làm; tin công khai bị loại bởi điều kiện doanh nghiệp ACTIVE. Filter hiện có chặn các API ghi ở khu vực Employer, gồm đăng tin và xử lý đơn. Kích hoạt lại không tự sửa các tin đã đóng/hết hạn hoặc trạng thái cửa hàng.
2. **Không dùng nút kích hoạt doanh nghiệp để duyệt hồ sơ.** Hồ sơ PENDING_VERIFICATION phải đi qua quy trình xét giấy tờ.
3. **Phê duyệt cửa hàng không tự bật hoạt động.** Admin có `/approval` riêng; `/status` chỉ thay hoạt động, không cấp phê duyệt. Employer bật hoạt động sau khi được duyệt. Thu hồi phê duyệt giữ cờ hoạt động nhưng tin công khai vẫn bị chặn bởi điều kiện phê duyệt; thay địa chỉ tiếp tục đặt cả hai về false theo logic Employer hiện có.
4. **Gỡ tin là kiểm duyệt độc lập với tạm dừng của Employer.** Dùng PAUSED cùng `moderationBlocked=true`. Employer không thể tự mở lại cờ kiểm duyệt. Admin khôi phục về ACTIVE chỉ khi tin chưa hết hạn, không có ngày xuất bản tương lai, cửa hàng đã duyệt/đang hoạt động và doanh nghiệp ACTIVE.
5. **Ưu tiên giữ lịch sử.** Chặn xóa cửa hàng có tin hoặc lịch sử việc làm; chặn xóa tin có đơn, trao đổi, báo cáo hoặc lượt lưu. Có thể gỡ/đóng tin thay vì xóa.
6. **Đánh giá ẩn vẫn thuộc người viết.** Người viết đọc được trạng thái HIDDEN trong hồ sơ riêng; Employer chỉ nhận đánh giá VISIBLE. Khôi phục không tạo bản ghi đánh giá hay việc làm mới.
7. **Ca qua đêm:** giờ kết thúc sớm hơn giờ bắt đầu nghĩa là ngày tiếp theo. Hai giờ bằng nhau bị từ chối; không coi là ca 24 giờ. Cờ linh hoạt không loại bỏ yêu cầu chọn khoảng giờ.
8. **CV và quyết định tuyển ứng viên giữ hành vi Employer.** Xác minh doanh nghiệp là quy trình riêng; không thay đổi quy tắc từ chối CV có lý do hoặc quyết định chấp nhận cuối cùng.

## Database và vận hành

Migration mới: [008_admin_moderation.sql](../database/migrations/008_admin_moderation.sql).
Thêm `job_posts.moderation_blocked BOOLEAN NOT NULL DEFAULT FALSE`.
Không thay enum JobStatus; frontend dùng ACTIVE/PAUSED/CLOSED/EXPIRED.
Ẩn/khôi phục đánh giá dùng ReviewStatus hiện có, không cần migration mới.

Profile local dùng Hibernate update để tạo cột. Môi trường tự quản schema cần áp dụng migration 008 **một lần**;
không chạy lại sau khi Hibernate đã tạo cột. Migration 004 về phê duyệt cửa hàng vẫn là điều kiện nâng cấp cho database cũ.

## Kiểm tra trình duyệt và giới hạn xác nhận

Đã xác nhận trực tiếp:

- Khách mở `/admin/dashboard` được chuyển đến login có returnTo.
- Đăng nhập Admin vào dashboard và thấy đủ 7 mục menu.
- Hai tab tài khoản và tìm theo email trả đúng tài khoản; nút tự khóa bị vô hiệu hóa.
- Form thêm ngành nghề chặn tên trống; tạo “Đồ uống QA” trên H2 và thấy slug `do-uong-qa`.
- Bố cục 390 × 844 có menu di động và bảng cuộn ngang.
- Logout trở về login; Employer đăng nhập rồi mở trực tiếp `/admin/users` bị đưa về khu vực công khai.

Ảnh kiểm chứng:
[Desktop](../audit/admin-desktop-qa.jpg) · [Mobile](../audit/admin-mobile-qa.jpg).

Đây là browser smoke test, không khẳng định đã thao tác mọi nút của cả 17 task trên trình duyệt.
Các luồng ghi phức tạp được xác nhận bằng integration test, gồm nộp giấy tờ → từ chối → User xem lý do → nộp lại → duyệt,
và cửa hàng → tin → đơn → kiểm duyệt/bảo vệ dữ liệu. Cloudinary và OTP được mock tại ranh giới dịch vụ trong test luồng giấy tờ;
không gửi SMTP hay upload Cloudinary thật. Bộ backend đầy đủ chạy H2; MySQL trong đợt này chỉ kiểm chứng migration 008 trên schema tạm.
Không chạy/khẳng định toàn repository sạch lint; phạm vi lint Admin đã đạt.

Không có task trong phạm vi còn bị chặn. ADM-17 (nhật ký), ADM-19 (tra cứu toàn bộ đơn/lịch sử), ADM-20 (báo cáo nâng cao/quản lý quyền) nằm ngoài đợt này.

## Lệnh chạy lại

Backend, từ `ParttimeHiringBackend`:

```powershell
.\mvnw.cmd test '-Dbackend.build.directory=target/admin-tests'
```

Frontend, từ `ParttimeHiringFrontend`:

```powershell
node --experimental-strip-types --test tests/*.test.mjs
npm run build
npx eslint src/pages/Admin src/components/Layout/AdminLayout.tsx src/services/admin*.ts
```

Trên môi trường sandbox chặn Java loopback, backend tests cần quyền chạy ngoài sandbox.
Không cần mở database MySQL nghiệp vụ để chạy bộ test này.

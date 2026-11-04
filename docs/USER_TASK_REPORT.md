# Báo cáo nhóm USER

Ngày: 05/11/2026. Nhánh: `feat/user-features`.

## Task và commit

| Task | Kết quả | Commit |
|---|---|---|
| USER-01 | Đăng ký; kế thừa validation và kiểm thử AUTH | AUTH-01 |
| USER-02 | Đăng nhập mật khẩu; kế thừa AUTH | AUTH-02 |
| USER-03 | Kiểm thử Google redirect, state và cấu hình client | 05a3bcf |
| USER-04 | Đăng xuất và thu hồi phiên; kế thừa AUTH | AUTH-05, AUTH-08 |
| USER-05 | Quên/reset mật khẩu; kế thừa AUTH | AUTH-09 |
| USER-06 | Đổi mật khẩu, thu hồi phiên cũ; kế thừa AUTH | AUTH-10 |
| USER-07 | Xem thông tin tài khoản hiện tại; kế thừa API và test AUTH | AUTH-14, AUTH-17 |
| USER-08 | Sửa hồ sơ, xác nhận mật khẩu, kiểm tra trùng, mapping an toàn | 895703a |
| USER-09 | Upload avatar, kiểm tra nội dung và kích thước ảnh | 0acc1db |
| USER-10 | Lọc trạng thái công khai của tin/cửa hàng/doanh nghiệp | 927c41b |
| USER-11 | Kiểm tra bộ lọc và hiển thị lỗi tìm kiếm | c10d45a |
| USER-12 | Chi tiết chỉ trả tin còn nhận tuyển | a913eeb |
| USER-13 | Phân trang BE/FE, giữ bộ lọc, chặn request quá lớn | 99f4ef6 |
| USER-14 | Kiểm tra điều kiện nhận đơn tại BE | 6239cd8 |
| USER-15 | Khóa tài khoản khi kiểm tra và tạo đơn để tránh trùng | 044acc1 |
| USER-16 | Lịch sử đơn của chính mình, response thống nhất và lỗi FE | 786723d |
| USER-17 | Sửa/rút đơn chờ, giữ lịch sử, chặn duyệt đơn đã rút | 642fefd |
| USER-18 | Trang và API lịch sử làm việc có phân trang | 4680fb4 |
| USER-19 | Tạo/sửa/xóa đánh giá gắn lịch sử làm việc đã xác nhận | 88029d6 |
| USER-20 | Lưu/bỏ lưu việc, trang việc yêu thích, chống lưu trùng | 7b0d905 |
| USER-21 | Kỹ năng/kinh nghiệm/CV riêng tư, chia sẻ qua đơn ứng tuyển | 4fb10b8 |
| USER-22 | Nộp giấy tờ có CSRF, validation ảnh và khóa hồ sơ chờ | 574872e |
| USER-23 | Gửi/xác nhận OTP email; kế thừa AUTH | AUTH-18, AUTH-19 |
| USER-24 | Hiển thị lý do từ chối và hướng dẫn gửi lại hồ sơ | e7c108b |
| USER-25 | Thông báo trạng thái đơn lưu ở BE, đánh dấu đã đọc | 2ed5ee6 |
| USER-26 | Trao đổi, phỏng vấn, báo cáo và xử lý báo cáo | e0f9ba7 |

Commit hoàn thiện cuối bổ sung kiểm thử tích hợp, migration, timestamp do Hibernate quản
lý, mapping MapStruct và sửa các lỗi tải dữ liệu phát hiện khi kiểm tra chất lượng.

## Kết quả xác nhận

- 81 test backend đạt, không failure/error, trên Java 17 và các database H2 riêng.
- 7 test frontend đạt. Frontend production build đạt; còn cảnh báo kích thước bundle.
- ESLint các file USER mới/sửa đạt. Không khẳng định toàn repository không còn lỗi lint.
- Luồng USER liên kết nhiều chức năng đạt trên MySQL 8 trong Docker, bằng database tạm
  `parttime_user_test_*`; database tạm đã được xóa. Không dùng database dự án để thử ghi.
- SQL migration 002/003 chạy thành công trên schema MySQL tạm có bảng cha tối thiểu;
  schema thử migration cũng đã được xóa.
- Yêu cầu OAuth chỉ đọc đến Google với client ID local trả HTTP 200, không thấy
  `invalid_client` hoặc `redirect_uri_mismatch`; không in credential.
- Chưa thực hiện Google consent/callback bằng tài khoản thật, gửi SMTP thật hoặc upload
  Cloudinary thật. Các ranh giới đó được kiểm thử bằng mock. Không có kiểm thử tương tác trình duyệt.
- Mã đã commit tại máy; nhánh chưa được push trong lượt làm việc này.

## Quy tắc cần biết khi test giao diện

- Đơn đã rút vẫn được lưu; hiện không nộp lại cùng một tin. Chỉ đơn chờ được sửa/rút.
- Đơn đã nhận không bị hoàn tác bằng cách xóa lịch sử nhân sự.
- Đánh giá yêu cầu lịch sử làm việc đã được doanh nghiệp xác nhận và đã đến ngày bắt đầu.
- CV chia sẻ là bản hiện tại của hồ sơ, không phải snapshot tại thời điểm nộp đơn.
- Tin nhắn/thông báo dùng tải lại hoặc nút Làm mới; chưa dùng WebSocket.
- Tài liệu API, route, giới hạn file và nâng cấp database: [USER_FEATURES.md](USER_FEATURES.md).

Không chạy lại migration nếu profile local đã tạo các bảng/cột tương ứng.

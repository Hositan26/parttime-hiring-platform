# Báo cáo rà soát chức năng — 04/11/2026

> Báo cáo lịch sử ngày 04/11/2026, trước các đợt AUTH/USER/ADMIN và database. Các kết quả lỗi/test dưới đây chỉ phản ánh thời điểm rà soát gốc.
> Cập nhật 09/11/2026: database dev/prod đã tách và dùng Flyway qua PR #6; đợt triển khai database đạt 137 test backend và frontend build. Hướng dẫn hiện tại ở [README](../README.md) và [database operations](../scripts/database/README.md). Tài liệu chi tiết trong `docs/` chỉ có ở local.

## Phạm vi và cách đọc kết quả

Đã đối chiếu router, trang, service frontend với 65 endpoint backend, service nghiệp vụ,
mapping, phân quyền và cấu hình. Đã gọi 96 request GET trên 24 đường dẫn bằng khách,
user_test, employer và admin. Kết quả gốc ở api-results.csv; danh mục endpoint ở
api-inventory.csv. Hai tập tin này không chứa token hay nội dung hồ sơ người dùng.

- **Có**: tìm thấy giao diện và xử lý tương ứng trong mã nguồn; không đồng nghĩa đã test hết.
- **Một phần/lỗi**: có triển khai nhưng thiếu bước hoặc có lỗi được mô tả.
- **Chưa có**: chưa tìm thấy luồng giao diện/API tương ứng trong repository.
- **API đọc đạt**: đã gọi thành công trong phiên rà soát, thường với danh sách trống.
- **Chưa kiểm chứng ghi**: chưa chạy thao tác tạo/sửa/xóa/duyệt bằng dữ liệu nghiệp vụ.

Không chỉnh mã nghiệp vụ trong lượt rà soát này. Không gửi mail, không upload tài liệu,
không khóa tài khoản hay xóa dữ liệu để thử. Không có kiểm tra tương tác trình duyệt.
Google/SMTP/Cloudinary đang dùng giá trị local thay thế nên chưa kiểm chứng tích hợp thật.

## Kết quả chạy

| Kiểm tra | Kết quả |
|---|---|
| Backend | Đang chạy với profile local |
| Backend test ở lượt sửa trước | 5/5 đạt; bộ test hẹp, không bao phủ toàn hệ thống |
| Frontend build | Không đạt: 6 lỗi TypeScript ở AdminEmployers.tsx |
| Frontend lint | 103 vấn đề: 95 lỗi, 8 cảnh báo |
| 96 request GET | 41 HTTP 200, 19 HTTP 302, 36 HTTP 500 |
| Dữ liệu nghiệp vụ | Các danh sách jobs/stores/categories/shifts/applications/employments/reviews/verifications được kiểm tra đang trống |

36 phản hồi 500 không có nghĩa 36 chức năng hỏng độc lập. Chúng gồm truy cập sai vai trò,
tài khoản không có hồ sơ doanh nghiệp, và yêu cầu chi tiết job ID 1 không tồn tại.
API admin có kiểm tra quyền; user/employer không đọc được dữ liệu admin, nhưng lỗi bị
đổi thành 500 thay vì 403. Khách chưa đăng nhập bị chuyển hướng 302 thay vì JSON 401.

## User / người tìm việc

| Chức năng | Trạng thái | Ghi nhận |
|---|---|---|
| Đăng ký tài khoản USER | Có | Đã tạo và đăng nhập user_test ở lượt trước; form chưa có email |
| Đăng nhập bằng mật khẩu | Có | Đã xác nhận tài khoản thử đăng nhập được |
| Đăng nhập Google | Một phần | Có OAuth backend và nút frontend; cần thông tin Google thật |
| Đăng xuất | Lỗi | Nút frontend chỉ xóa localStorage, không gọi API xóa cookie HttpOnly |
| Quên/đặt lại mật khẩu | Chưa có | Link “Quên mật khẩu?” trỏ #; không có API tương ứng |
| Đổi mật khẩu | Chưa có | Xác nhận mật khẩu khi sửa profile không phải đổi mật khẩu |
| Xem hồ sơ cá nhân | Có | API đọc đạt |
| Sửa tên hiển thị, username, email, ngày sinh | Có, cần bổ sung | Có yêu cầu mật khẩu hiện tại; đổi username chưa cấp lại JWT |
| Upload/đổi avatar | Chưa có | Có lưu/hiển thị avatar và ảnh Google; chưa có luồng upload avatar riêng |
| Danh sách việc làm | Có | API đọc đạt, dữ liệu trống |
| Tìm việc theo tiêu đề, cửa hàng | Có | Frontend truyền bộ lọc và backend có điều kiện tìm kiếm |
| Lọc ngành nghề, ca làm, lương, thành phố/quận/phường/đường | Có | API search/categories/shifts đọc đạt với dữ liệu trống; chưa thử đối chiếu dữ liệu mẫu |
| Chi tiết việc làm, lương, yêu cầu, quyền lợi, ca, ảnh, đánh giá | Có, cần bổ sung | ID không tồn tại trả 500; truy cập chi tiết chưa kiểm tra trạng thái hiển thị công khai |
| Phân trang danh sách việc làm công khai | Chưa có | Backend trả List, chưa có Page/page/size |
| Ứng tuyển bằng điện thoại và ghi chú | Một phần | Có lưu đơn; chưa chặn trạng thái/hạn tin ở backend |
| Chặn ứng tuyển trùng cùng tin | Có | Có exists check; chưa thử đồng thời nhiều request |
| Xem đơn đã nộp và trạng thái chờ/nhận/từ chối | Có | API đọc đạt; có trang AppliedJobs |
| Sửa/rút/hủy đơn đã nộp | Chưa có | Không thấy endpoint và thao tác tương ứng |
| Xem lịch sử làm việc riêng | Chưa có | Có entity EmploymentRecord nhưng chưa có màn hình/API riêng cho user |
| Gửi/sửa/xóa đánh giá sau khi làm việc | Chưa có | Có hiển thị đánh giá, entity, repository và admin xóa; chưa có API user tạo đánh giá |
| Lưu việc/yêu thích | Chưa có | Không có luồng lưu theo user |
| CV/hồ sơ ứng tuyển, kỹ năng/kinh nghiệm | Chưa có | Hiện đơn chỉ có điện thoại, ghi chú và thông tin user |
| Đăng ký trở thành doanh nghiệp: form và upload giấy tờ | Một phần | Có form và API; phụ thuộc SMTP/Cloudinary; duyệt chưa hoàn tất bước chuyển vai trò |
| Gửi OTP xác minh email | Một phần | Có backend; chưa có giới hạn gửi/thử mã; frontend xác nhận chỉ kiểm tra đủ 6 ký tự |
| Theo dõi trạng thái hồ sơ doanh nghiệp | Có | API đúng /api/users/employer-verifications/my-status đọc đạt |
| Hiển thị lý do bị từ chối ở form | Một phần | Backend trả rejectionReason; frontend chưa lưu/trình bày lý do này |
| Thông báo khi đơn thay đổi | Chưa có | Chuông giao diện chưa có hệ thống notification |
| Nhắn tin/phỏng vấn/báo cáo tin vi phạm | Chưa có | Chưa tìm thấy luồng tương ứng |

## Employer / doanh nghiệp

| Chức năng | Trạng thái | Ghi nhận |
|---|---|---|
| Đăng nhập tài khoản doanh nghiệp | Có | employer đăng nhập thành công |
| Bảo vệ giao diện doanh nghiệp theo role | Chưa đủ | /employer chỉ bọc EmployerLayout, chưa có EmployerRoute |
| Dashboard: cửa hàng, tin, đơn, đơn chờ, biểu đồ, tin sắp hết hạn | Có | API overview đọc đạt; chưa kiểm chứng số liệu với dữ liệu phong phú |
| Xem/sửa hồ sơ doanh nghiệp | Có | Có businessType, email, điện thoại, mô tả, website, đại diện; API đọc đạt |
| Xem giấy tờ/trạng thái xác minh | Có | Profile lấy hồ sơ xác minh gần nhất; tích hợp giấy tờ chưa thử thật |
| Tạo cửa hàng với địa chỉ nhiều cấp và liên hệ | Có | Có modal và API, mặc định isActive=false; chưa kiểm chứng ghi |
| Xem danh sách/thống kê/sắp xếp cửa hàng | Có | API đọc đạt |
| Xem chi tiết cửa hàng, tin và nhân sự tại cửa hàng | Có | Có kiểm tra chủ sở hữu ở EmployerStoreServiceImpl |
| Sửa/xóa cửa hàng | Có, cần bổ sung | Có hạn chế; chưa kiểm chứng FK khi đã có dữ liệu liên quan |
| Bật/tắt cửa hàng | Lỗi quy trình | Employer có thể tự bật false thành true, dùng cùng cờ với trạng thái chờ admin duyệt |
| Ảnh/media riêng cho cửa hàng | Chưa có đầy đủ | Chưa thấy API quản lý bộ ảnh cửa hàng; ảnh mặt tiền thuộc hồ sơ xác minh |
| Tạo tin tuyển dụng, lương, tuổi, giới tính, số lượng, ngành, ca, hạn | Có, cần bổ sung | Lưu ACTIVE trực tiếp; chưa kiểm tra cửa hàng đã duyệt/doanh nghiệp bị đình chỉ |
| Danh sách tin phân trang, lọc cửa hàng/trạng thái | Có | API đọc đạt |
| Tìm tiêu đề tin ở trang employer | Chưa nối | Có searchQuery/onChange nhưng không dùng query để lọc hoặc gọi API; bảng vẫn jobs.map |
| Xem/sửa tin, chọn ngành/ca, gia hạn | Có | Có drawer và backend; quy tắc trạng thái/hạn chưa nhất quán giữa PUT/PATCH |
| Tạm dừng/đóng/mở lại/xóa tin | Có, cần bổ sung | Có ownership và chặn xóa khi có đơn; chưa kiểm chứng ghi |
| Thêm/xóa ảnh tin | Có, chưa xác minh tích hợp | Backend/frontend có luồng Cloudinary; cần khóa thật |
| Tự động đồng bộ EXPIRED theo thời gian | Chưa đầy đủ | Search lọc theo thời gian, nhưng chưa thấy tác vụ lịch cập nhật trạng thái tất cả tin |
| Xem ứng viên theo tin | Có | Có API và tab ứng viên |
| Xem đánh giá theo tin | Có | Chỉ đọc đánh giá qua EmploymentRecord; chưa có phản hồi đánh giá |
| Xem đơn, lọc cửa hàng/trạng thái, hồ sơ ứng viên | Có | API đọc đạt, dữ liệu trống |
| Tìm kiếm chữ trong danh sách đơn | Chưa nối | Input không có value/onChange và không lọc dữ liệu |
| Chấp nhận/từ chối đơn | Có, cần bổ sung | Có kiểm tra quyền sở hữu; nhận đơn tạo EmploymentRecord |
| Hoàn tác nhận đơn | Có, cần bổ sung | ACCEPTED -> REJECTED xóa EmploymentRecord; cần bảo vệ lịch sử làm việc/đánh giá phụ thuộc |
| Quản lý nhân sự: danh sách, lọc, hồ sơ | Có | API danh sách đọc đạt |
| Nhân sự theo storeId | Lỗi quyền sở hữu | Service chỉ xác minh có Employer, chưa xác minh storeId thuộc Employer đó |
| Tìm kiếm chữ trong danh sách nhân sự | Chưa nối | Input không có value/onChange |
| Ghi nhận nghỉ việc/sa thải, lý do và ngày kết thúc | Có | Có frontend và backend, chặn cập nhật người đã nghỉ; chưa kiểm chứng ghi |
| Lịch làm việc/chấm công/lương | Chưa có | WorkShift hiện chỉ phục vụ tin tuyển dụng |
| Thông báo/nhắn tin/hẹn phỏng vấn | Chưa có | Không thấy luồng hoàn chỉnh |
| Đăng xuất | Lỗi | Không gọi API logout, cookie vẫn tồn tại |

## Admin

| Chức năng | Trạng thái | Ghi nhận |
|---|---|---|
| Đăng nhập và chặn frontend theo ADMIN | Có | AdminRoute gọi getMe; endpoint admin có hasRole ADMIN |
| Dashboard số user/doanh nghiệp/tin/đơn và đăng ký mới | Một phần/lỗi | API đọc đạt; totalApplications đang đếm EmploymentRecord, không phải JobApplication |
| Danh sách user, phân trang | Có | API đọc đạt |
| Khóa/mở khóa tài khoản | Một phần/lỗi | Có API và UI; JWT filter chưa kiểm tra isEnabled nên cookie cũ có nguy cơ vẫn dùng được |
| Tìm user theo tên/email | Chưa nối | Input giao diện chưa truyền tiêu chí tìm kiếm |
| Danh sách doanh nghiệp và phân trang | Có | API đọc đạt; frontend trang này đang gây build lỗi |
| Đổi trạng thái doanh nghiệp | Một phần/lỗi | Có lưu trạng thái, chưa được kiểm tra trong các hành động tuyển dụng |
| Khóa/mở khóa tài khoản doanh nghiệp | Một phần/lỗi | UI dùng isActive nhưng interface frontend thiếu thuộc tính này; còn import thừa |
| Tìm doanh nghiệp theo tên | Chưa nối | Input giao diện chưa có xử lý |
| Danh sách hồ sơ xác minh theo trạng thái, xem giấy tờ | Có | API danh sách đọc đạt; chi tiết giấy tờ chưa thử với dữ liệu |
| Duyệt hồ sơ doanh nghiệp | Lỗi quy trình | Chỉ tìm Employer có sẵn; không tạo Employer cho USER mới và không gán role EMPLOYER |
| Từ chối, lưu lý do, gửi mail kết quả | Một phần | Có xử lý; dùng email tài khoản thay vì contactEmail hồ sơ, tích hợp mail chưa thử |
| Danh sách tin, lọc trạng thái, đổi trạng thái | Có | API đọc đạt; thay đổi trạng thái chưa thử |
| Xóa tin bởi admin | Một phần | Có DELETE backend; chưa thấy nút/thao tác xóa trong trang AdminJobPosts |
| Tìm tin theo tên | Chưa nối | Input giao diện chưa có xử lý |
| Quản lý cửa hàng: danh sách, lọc hoạt động, bật/tắt | Có, cần bổ sung | API đọc đạt; isActive gộp chờ duyệt và ngừng hoạt động, không lưu lý do duyệt/từ chối riêng |
| Xóa cửa hàng bởi admin | Một phần | Có DELETE backend; chưa thấy nút/thao tác xóa trong trang AdminStores |
| Tìm cửa hàng theo tên | Chưa nối | Input giao diện chưa có xử lý |
| Ngành nghề: danh sách, thêm, sửa, xóa, phân trang | Có | API đọc đạt; slug tiếng Việt và xóa danh mục đang dùng cần kiểm chứng thêm |
| Ca làm: danh sách, thêm, sửa, xóa, phân trang | Có | API đọc đạt; chưa thử ràng buộc ca trùng/ca qua đêm |
| Tìm ngành nghề/ca làm | Chưa nối | Các input tìm kiếm chưa nối xử lý |
| Đánh giá: danh sách và xóa | Có | API đọc đạt; nguồn đánh giá từ user chưa có luồng tạo |
| Ẩn/duyệt/khôi phục đánh giá | Chưa có | Controller chỉ GET và DELETE |
| Tìm đánh giá theo cửa hàng/người viết | Chưa nối | Input giao diện chưa có xử lý |
| Tạo/sửa user, đặt lại mật khẩu, quản lý role/permission | Chưa có giao diện/API quản trị | Có entity role/permission không đồng nghĩa có chức năng quản trị |
| Tra cứu toàn bộ đơn và lịch sử làm việc riêng cho admin | Chưa có | Chưa có màn hình/API quản trị tương ứng |
| Nhật ký thao tác quản trị, khiếu nại/báo cáo | Chưa có | Chưa thấy luồng và lưu vết nghiệp vụ riêng |
| Xuất báo cáo CSV/Excel, chọn khoảng thời gian | Chưa có | Dashboard hiện là số tổng và đăng ký mới trong tháng |
| Thông báo quản trị/cấu hình hệ thống | Chưa có | Chuông hiện mới là giao diện |
| Đăng xuất | Lỗi | Chỉ xóa localStorage, chưa gọi logout backend |

## Lỗi cần ưu tiên

### P1 — quyền truy cập và luồng cốt lõi

1. **Đọc nhân sự chéo doanh nghiệp qua storeId**: EmployerEmploymentServiceImpl.java,
   getEmploymentsByStore chỉ gọi verifyEmployer rồi query storeId. Cần xác minh chủ sở hữu.
   Đây là kết luận mã nguồn; database trống nên chưa chứng minh lộ hồ sơ thực tế.
2. **Khóa tài khoản chưa chặn cookie JWT cũ**: JwtAuthenticationFilter tạo authentication
   từ UserDetails mà không kiểm tra isEnabled; CustomUserDetailsService có nạp isActive
   nhưng filter không sử dụng để từ chối. Chưa thực hiện khóa tài khoản để tái hiện.
3. **Logout frontend không logout server**: MainLayout, EmployerSidebar, AdminLayout chỉ
   xóa localStorage. Backend đọc access_token cookie, không đọc các khóa localStorage đó.
4. **USER -> EMPLOYER chưa hoàn chỉnh**: submit chỉ lưu verification; approve yêu cầu
   Employer đã tồn tại, không tạo mới và không gán role. Cần hoàn thiện giao dịch cấp quyền.
5. **Có thể bỏ qua kiểm duyệt cửa hàng/tin**: toggleStoreStatus cho chủ cửa hàng tự bật;
   createEmployerJob đặt ACTIVE và không kiểm tra store.isActive/employer.status.
6. **Ứng tuyển bỏ qua trạng thái/hạn tin**: applyForJob chỉ kiểm tra tin tồn tại và trùng đơn;
   cần kiểm tra ACTIVE, expiredAt, cửa hàng/doanh nghiệp, và điều kiện tuyển dụng đã chốt.
7. **Frontend không build**: AdminEmployers.tsx có 2 import không dùng và 4 chỗ dùng
   isActive trong khi AdminEmployerResponse của frontend chưa khai báo thuộc tính này.

### P2 — dữ liệu và trải nghiệm

- Handler tổng quát đổi AccessDenied và nhiều lỗi không tồn tại thành HTTP 500.
- API chưa đăng nhập trả redirect 302; frontend có thể nhận HTML thay vì JSON.
- Đổi username làm JWT mang username cũ; cần phát lại cookie hoặc dùng định danh bất biến.
- Dashboard admin đếm nhầm bảng cho tổng ứng tuyển.
- OTP frontend báo xác minh sau khi nhập đủ ký tự, trong khi backend chỉ kiểm tra thật
  lúc nộp hồ sơ. email.service.ts có hàm gọi verify-otp nhưng backend chưa có endpoint đó;
  trang hiện không gọi hàm này. Backend vẫn kiểm tra OTP khi submit, không phải bỏ qua OTP.
- OTP chưa thấy giới hạn gửi/thử mã, chưa buộc theo tài khoản; chưa đồng nhất phản hồi lỗi.
- Kết quả từ chối trả lý do ở backend nhưng frontend chưa hiển thị.
- Các trang list đang bắt lỗi bằng console rồi có thể hiển thị trống/0 như không có dữ liệu.
- Kiểm tra chuyển trạng thái đơn và tính duy nhất EmploymentRecord còn cần bổ sung;
  undo không nên làm mất lịch sử đã phát sinh.
- Xóa job/store/category/shift đã có tham chiếu cần quy tắc rõ, tránh lỗi FK/500.
- Tin công khai chưa lọc store.isActive/employer.status; getById không áp dụng bộ lọc
  ACTIVE/hạn như danh sách. Chưa có tác vụ tự đồng bộ EXPIRED.

## Tính năng đã nêu trong README nhưng chưa triển khai hoàn chỉnh

- AI kiểm duyệt/gắn cờ gian lận: chưa tìm thấy service, API hoặc tích hợp AI.
- User viết đánh giá gắn lịch sử làm việc: mới có dữ liệu và đọc/xóa ở phía khác.
- CV, AI gợi ý ứng viên/việc, real-time notification, hẹn phỏng vấn,
  analytics nâng cao và mobile app: chưa có; README cũng liệt kê nhiều mục là tương lai.

## Thứ tự hoàn thiện đề xuất

1. Sửa build frontend; quyền sở hữu nhân sự; khóa tài khoản/JWT; logout và HTTP 401/403.
2. Hoàn thiện USER nộp hồ sơ -> admin duyệt -> tạo Employer/cấp role -> truy cập dashboard.
3. Tách trạng thái phê duyệt cửa hàng và hoạt động; chặn doanh nghiệp bị đình chỉ;
   kiểm tra hạn/trạng thái khi ứng tuyển và thay đổi trạng thái.
4. Tạo bộ dữ liệu test riêng rồi chạy toàn luồng cửa hàng -> tin -> ứng tuyển -> duyệt
   -> nhân sự -> nghỉ việc -> đánh giá; kiểm tra cả hai doanh nghiệp độc lập.
5. Nối tìm kiếm, sửa thống kê, hiển thị lỗi, bổ sung rút đơn và đánh giá user.
6. Kiểm chứng SMTP/Cloudinary/Google thật trong môi trường phát triển và mở rộng test.

HTTP 200 trên danh sách trống và 5 bài test hiện có không đủ để công nhận toàn hệ thống
hoàn thiện. Các thao tác ghi, dữ liệu nhiều bản ghi, tính đồng thời và giao diện thực tế
cần một vòng kiểm thử riêng sau khi xử lý các lỗi ưu tiên.

USE parttime_hiring_platform;

-- 1. ROLE
INSERT INTO role(role_name, description) VALUES
('ADMIN', 'System administrator'),
('EMPLOYER', 'Employer who posts job listings'),
('USER', 'Regular user looking for part-time jobs');

-- 2. USERS
INSERT INTO users (
    user_id,
    username,
    password,
    display_name,
    email,
    avatar_url,
    dob
)
VALUES
(1, 'admin', '$2a$10$E13luNJBL.RtFDdCPYyyye5ma.bBDuVRzHQB3mlRjsLS8igVV3qjW', 'Admin', 'admin@jobportal.com', NULL, '2000-01-01'),
(2, 'employer_obt', '$2a$10$E13luNJBL.RtFDdCPYyyye5ma.bBDuVRzHQB3mlRjsLS8igVV3qjW', 'Obt Milktea Manager', 'hr@obtcoffee.vn', NULL, '1995-05-10'),
(3, 'tan', '$2a$10$E13luNJBL.RtFDdCPYyyye5ma.bBDuVRzHQB3mlRjsLS8igVV3qjW', 'Hồ Sĩ Tân', 'tan@gmail.com', NULL, '2005-06-10');

-- 3. USER ROLES
INSERT INTO user_roles(user_id, role_name) VALUES
(1, 'ADMIN'),
(2, 'EMPLOYER'),
(3, 'USER');

-- 4. EMPLOYER
INSERT INTO employers (
    employer_id,
    user_id,
    company_name,
    business_type,
    email_contact,
    phone_contact,
    description,
    website,
    status
)
VALUES
(
    1,
    2,
    'Obt Milktea & Coffee Group',
    'Cafe - Trà sữa',
    'hr@obtcoffee.vn',
    '0914768239',
    'Chuỗi cửa hàng trà sữa và cà phê tuyển dụng nhân viên part-time cho sinh viên tại Đà Nẵng.',
    'https://obtcoffee.vn',
    'ACTIVE'
);

-- 5. STORES
INSERT INTO stores (
    store_id,
    employer_id,
    store_name,
    phone_contact,
    description,
    city,
    district,
    ward,
    street_address,
    latitude,
    longitude,
    is_active
)
VALUES
(
    1,
    1,
    'Obt Milktea & Coffee - Hải Châu',
    '0914768239',
    'Quán trà sữa và cà phê phù hợp với học sinh, sinh viên. Môi trường làm việc trẻ trung, thân thiện.',
    'Đà Nẵng',
    'Hải Châu',
    'Thanh Bình',
    '35 Cao Thắng, Hải Châu, Đà Nẵng',
    16.07400000,
    108.21900000,
    TRUE
),
(
    2,
    1,
    'Obt Milktea & Coffee - Liên Chiểu',
    '0905119689',
    'Chi nhánh gần khu sinh viên, tuyển nhiều vị trí ca sáng và ca tối.',
    'Đà Nẵng',
    'Liên Chiểu',
    'Hòa Minh',
    '535 Kinh Dương Vương, Liên Chiểu, Đà Nẵng',
    16.08170000,
    108.15860000,
    TRUE
);

-- 6. JOB CATEGORIES
INSERT INTO job_categories (
    category_id,
    category_name,
    slug,
    description,
    is_active,
    sort_order
)
VALUES
(1, 'PART_TIME', 'part-time', 'Công việc bán thời gian', TRUE, 1),
(2, 'PHỤC VỤ', 'phuc-vu', 'Công việc phục vụ', TRUE, 2),
(3, 'CAFE - TRÀ SỮA', 'cafe-tra-sua', 'Đồ uống', TRUE, 3),
(4, 'CHĂM SÓC KHÁCH HÀNG TRỰC TIẾP', 'cham-soc-kh', 'CSKH trực tiếp tại cửa hàng', TRUE, 4),
(5, 'PART-TIME SINH VIÊN', 'part-time-sv', 'Công việc ưu tiên sinh viên', TRUE, 5),
(6, 'THU NGÂN', 'thu-ngan', 'Công việc thu ngân tại quầy', TRUE, 6),
(7, 'PHA CHẾ', 'pha-che', 'Công việc pha chế đồ uống', TRUE, 7);

-- 7. WORK SHIFTS
INSERT INTO work_shifts (
    shift_id,
    shift_name,
    start_time,
    end_time,
    is_flexible,
    sort_order,
    is_active
)
VALUES
(1, 'Ca linh hoạt', NULL, NULL, TRUE, 1, TRUE),
(2, 'Ca sáng', '07:00:00', '11:00:00', FALSE, 2, TRUE),
(3, 'Ca chiều', '13:00:00', '17:00:00', FALSE, 3, TRUE),
(4, 'Ca tối', '18:00:00', '22:00:00', FALSE, 4, TRUE),
(5, 'Ca cuối tuần', '08:00:00', '16:00:00', FALSE, 5, TRUE);

-- 8. JOB POSTS
INSERT INTO job_posts (
    job_post_id,
    employer_id,
    store_id,
    title,
    job_description,
    requirements,
    benefits,
    hourly_wage_min,
    hourly_wage_max,
    currency,
    vacancy_count,
    min_age,
    max_age,
    gender_requirement,
    employment_type,
    status,
    published_at,
    expired_at
)
VALUES
(
    1,
    1,
    1,
    'Nhân viên bán trà sữa & phục vụ - Obt Milktea & Coffee',
    'Bán trà sữa và thức ăn cho khách. Phục vụ khách hàng tại quán. Hỗ trợ dọn dẹp và các công việc liên quan trong ca làm.',
    'Nhanh nhẹn, trung thực. Có thể xoay ca theo lịch học. Ưu tiên sinh viên có thái độ tốt.',
    'Làm tốt trên 6 tháng sẽ được nâng lương. Sắp xếp ca linh hoạt theo lịch học. Môi trường trẻ trung, thân thiện.',
    16000,
    22000,
    'VND',
    3,
    18,
    25,
    'ANY',
    'PART_TIME',
    'ACTIVE',
    NOW(),
    DATE_ADD(NOW(), INTERVAL 30 DAY)
),
(
    2,
    1,
    1,
    'Nhân viên phục vụ ca tối',
    'Phục vụ khách hàng, nhận order, dọn bàn và hỗ trợ khu vực quầy trong ca tối.',
    'Có thể làm từ 18h đến 22h. Chăm chỉ, đúng giờ, có trách nhiệm.',
    'Hỗ trợ nước uống trong ca. Có thưởng chuyên cần. Phù hợp sinh viên học ban ngày.',
    18000,
    25000,
    'VND',
    4,
    18,
    28,
    'ANY',
    'SHIFT_BASED',
    'ACTIVE',
    NOW(),
    DATE_ADD(NOW(), INTERVAL 25 DAY)
),
(
    3,
    1,
    2,
    'Nhân viên pha chế part-time',
    'Pha chế trà sữa, cà phê và các loại đồ uống theo công thức có sẵn. Chuẩn bị nguyên liệu và giữ vệ sinh khu vực quầy.',
    'Ưu tiên có kinh nghiệm pha chế. Nếu chưa có kinh nghiệm sẽ được đào tạo.',
    'Được training pha chế. Cơ hội tăng lương sau 2 tháng. Môi trường năng động.',
    20000,
    28000,
    'VND',
    2,
    18,
    27,
    'ANY',
    'PART_TIME',
    'ACTIVE',
    NOW(),
    DATE_ADD(NOW(), INTERVAL 40 DAY)
),
(
    4,
    1,
    2,
    'Thu ngân quầy trà sữa',
    'Thanh toán hóa đơn, hỗ trợ khách hàng, kiểm tra đơn hàng và phối hợp với nhân viên pha chế.',
    'Cẩn thận, trung thực, biết sử dụng máy tính cơ bản. Giao tiếp tốt.',
    'Được đào tạo quy trình thu ngân. Thưởng theo hiệu suất làm việc.',
    19000,
    26000,
    'VND',
    2,
    18,
    30,
    'FEMALE',
    'PART_TIME',
    'ACTIVE',
    NOW(),
    DATE_ADD(NOW(), INTERVAL 35 DAY)
),
(
    5,
    1,
    1,
    'Nhân viên hỗ trợ cuối tuần',
    'Hỗ trợ phục vụ khách, sắp xếp bàn ghế, chuẩn bị nguyên liệu và hỗ trợ các công việc vận hành cửa hàng vào cuối tuần.',
    'Có thể làm thứ 7 và chủ nhật. Nhanh nhẹn, vui vẻ, chịu khó.',
    'Lịch làm linh hoạt. Phù hợp sinh viên muốn làm thêm cuối tuần. Có phụ cấp nếu làm tốt.',
    17000,
    24000,
    'VND',
    5,
    18,
    26,
    'ANY',
    'SEASONAL',
    'ACTIVE',
    NOW(),
    DATE_ADD(NOW(), INTERVAL 20 DAY)
);

-- 9. JOB POST CATEGORIES
INSERT INTO job_post_categories (
    job_post_id,
    category_id
)
VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
(2, 1), (2, 2), (2, 5),
(3, 1), (3, 3), (3, 5), (3, 7),
(4, 1), (4, 4), (4, 5), (4, 6),
(5, 1), (5, 2), (5, 5);

-- 10. JOB POST SHIFTS
INSERT INTO job_post_shifts (
    job_post_id,
    shift_id
)
VALUES
(1, 1),
(2, 4),
(3, 2),
(3, 3),
(4, 3),
(5, 5);

-- 11. JOB POST IMAGES
INSERT INTO job_post_images (
    job_post_id,
    image_url,
    sort_order
)
VALUES
(1, 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80', 1),
(1, 'https://images.unsplash.com/photo-1525648199074-cee30ba79a4a?auto=format&fit=crop&w=800&q=80', 2),
(2, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', 1),
(3, 'https://images.unsplash.com/photo-1495474472205-16284eb86b5a?auto=format&fit=crop&w=800&q=80', 1),
(4, 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80', 1),
(5, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', 1);

-- 12. KIỂM TRA KẾT QUẢ
SELECT 
    jp.job_post_id,
    jp.title,
    s.store_name,
    e.company_name,
    jp.hourly_wage_min,
    jp.hourly_wage_max,
    jp.currency,
    jp.vacancy_count,
    jp.status
FROM job_posts jp
JOIN stores s ON jp.store_id = s.store_id
JOIN employers e ON jp.employer_id = e.employer_id
ORDER BY jp.job_post_id;
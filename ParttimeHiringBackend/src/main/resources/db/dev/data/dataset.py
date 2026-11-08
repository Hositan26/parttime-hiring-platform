"""Deterministic, fictional recruitment fixtures; no database access in this module."""

from collections import Counter
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from pathlib import Path

SEED_KEY = "parttime-demo-v1"
ROOT = Path(__file__).resolve().parents[2]
NAMES = [
    "Nguyễn Minh An", "Trần Ngọc Anh", "Lê Hoàng Bảo", "Phạm Gia Bình",
    "Võ Minh Châu", "Đặng Thùy Chi", "Bùi Quốc Cường", "Đỗ Hải Dương",
    "Hồ Ngọc Diệp", "Ngô Minh Đức", "Dương Khánh Hà", "Lý Thanh Hải",
    "Mai Thu Hằng", "Nguyễn Gia Hân", "Trần Minh Hiếu", "Lê Quốc Huy",
    "Phạm Ngọc Khánh", "Võ Mỹ Linh", "Đặng Hoàng Long", "Bùi Khánh Ly",
    "Đỗ Nhật Minh", "Hồ Bảo Ngân", "Ngô Thảo Nguyên", "Dương Hoàng Nam",
    "Lý Thanh Nhi", "Mai Hồng Nhung", "Nguyễn Phương Oanh", "Trần Hải Phong",
    "Lê Minh Phúc", "Phạm Ngọc Quỳnh", "Võ Anh Quân", "Đặng Minh Tâm",
    "Bùi Bảo Thảo", "Đỗ Thanh Thư", "Hồ Minh Tiến", "Ngô Anh Tú",
    "Dương Ngọc Trâm", "Lý Hải Vân", "Mai Khánh Vy", "Nguyễn Minh Yến",
]
COMPANIES = [
    ("Mây Sớm Coffee", "Cà phê", "Pha chế"),
    ("Lá Non Tea", "Trà và đồ uống", "Phục vụ"),
    ("Bếp Nhỏ Bistro", "Nhà hàng", "Phụ bếp"),
    ("Tiệm Sách Bình Minh", "Bán lẻ sách", "Bán hàng"),
    ("Chợ Xanh Mini", "Cửa hàng tiện lợi", "Thu ngân"),
    ("Gói Gọn Logistics", "Kho vận", "Kho hàng"),
    ("Sắc Màu Studio", "Sáng tạo", "Hỗ trợ sự kiện"),
    ("Hạt Nắng Bakery", "Bánh ngọt", "Đóng gói"),
    ("Mộc Mây Kitchen", "Ẩm thực", "Phục vụ"),
    ("Vườn Phố Market", "Bán lẻ", "Bán hàng"),
]
CATEGORIES = [
    ("Phục vụ", "phuc-vu"), ("Pha chế", "pha-che"), ("Thu ngân", "thu-ngan"),
    ("Bán hàng", "ban-hang"), ("Phụ bếp", "phu-bep"), ("Kho hàng", "kho-hang"),
    ("Đóng gói", "dong-goi"), ("Hỗ trợ sự kiện", "ho-tro-su-kien"),
    ("Chăm sóc khách hàng", "cham-soc-khach-hang"), ("Gia sư", "gia-su"),
    ("Nội dung số", "noi-dung-so"), ("Hành chính", "hanh-chinh"),
]
SHIFTS = [
    ("Ca sáng", "06:00:00", "12:00:00", False),
    ("Ca chiều", "12:00:00", "18:00:00", False),
    ("Ca tối", "18:00:00", "22:00:00", False),
    ("Cuối tuần", "08:00:00", "16:00:00", False),
    ("Linh hoạt", "09:00:00", "15:00:00", True),
    ("Qua đêm", "22:00:00", "06:00:00", False),
]


@dataclass(frozen=True)
class Ref:
    key: str


@dataclass
class Record:
    key: str
    table: str
    primary_key: str | None
    values: dict


class Dataset:
    def __init__(self):
        self.records = []
        self.keys = set()

    def add(self, key, table, primary_key, **values):
        if key in self.keys:
            raise ValueError(f"Duplicate fixture key: {key}")
        self.keys.add(key)
        self.records.append(Record(key, table, primary_key, values))
        return Ref(key)

    def counts(self):
        return dict(sorted(Counter(record.table for record in self.records).items()))


def build_dataset(reference_date, asset_base, password_hash, resume_dir=None):
    """Build coherent dates and references without assuming any existing IDs."""
    data = Dataset()
    now = datetime.combine(reference_date, datetime.min.time()).replace(hour=9)
    asset_base = asset_base.rstrip("/")
    users, employers, stores, jobs, applications, employments = [], [], [], [], [], []

    def add_user(key, username, display_name, role_names, number, active=True):
        user = data.add(key, "users", "user_id", username=username, password=password_hash,
                        display_name=display_name, email=f"{username}@example.invalid",
                        avatar_url=f"{asset_base}/avatar-{number % 8 + 1:02}.svg",
                        dob=date(1995 + number % 9, number % 12 + 1, number % 25 + 1),
                        is_active=active, auth_version=0, row_version=0,
                        created_at=now - timedelta(days=number % 150 + 1))
        for role in role_names:
            data.add(f"{key}.role.{role}", "user_roles", None, user_id=user, role_name=role)
        return user

    admins = [add_user(f"admin.{i}", f"demo_admin_{i:02}", f"Quản trị Demo {i}", ["ADMIN"], i)
              for i in range(1, 3)]
    employer_users = [add_user(f"employer-user.{i}", f"demo_employer_{i:02}",
                              f"Quản lý {COMPANIES[i-1][0]}", ["USER", "EMPLOYER"], 10 + i)
                      for i in range(1, 11)]
    for i, name in enumerate(NAMES):
        users.append(add_user(f"candidate.{i}", f"demo_user_{i+1:02}", name,
                              ["USER"], 30 + i, active=i < 38))

    for i, (company, business, _) in enumerate(COMPANIES):
        employers.append(data.add(f"employer.{i}", "employers", "employer_id",
            user_id=employer_users[i], company_name=f"{company} [Demo]", business_type=business,
            email_contact=f"hr{i+1:02}@example.invalid", phone_contact=f"09000000{i+1:02}",
            description=f"{company} là doanh nghiệp GIẢ LẬP phục vụ kiểm thử. "
                        "Đội ngũ trẻ, lịch làm theo ca, đào tạo cho ứng viên chưa có kinh nghiệm.",
            website=None, tax_code=f"DEMO-TAX-{i+1:04}", representative_name=f"Đại diện Demo {i+1}",
            status="ACTIVE" if i < 8 else "SUSPENDED",
            created_at=now - timedelta(days=i * 13 + 4), updated_at=now - timedelta(days=2)))

    for i in range(15):
        approved, rejected = i < 5, i >= 11
        applicant = employer_users[i] if approved else users[24 + (i - 5)]
        company = COMPANIES[i][0] if approved else f"Doanh nghiệp xác minh Demo {i+1:02}"
        submitted = now - timedelta(days=15 - i)
        data.add(f"verification.{i}", "employer_verifications", "verification_id",
            user_id=applicant, admin_id=admins[i % 2] if approved or rejected else None,
            contact_email=f"verification{i+1:02}@example.invalid", phone_contact=f"09000001{i:02}",
            address="Địa chỉ minh họa, Đà Nẵng - dữ liệu demo", company_name=f"{company} [Demo]",
            representative_name=f"Đại diện hồ sơ {i+1:02}", tax_code=f"DEMO-VERIFY-{i+1:04}",
            store_front_image_url=f"{asset_base}/store-{i % 10 + 1:02}.png",
            id_card_front_url=f"{asset_base}/document-front.png",
            id_card_back_url=f"{asset_base}/document-back.png",
            business_license_url=None if i % 3 == 0 else f"{asset_base}/document-license.png",
            verification_status="APPROVED" if approved else "REJECTED" if rejected else "PENDING",
            rejection_reason="Ảnh tài liệu minh họa chưa rõ; vui lòng bổ sung hồ sơ đọc được." if rejected else None,
            submitted_at=submitted, verified_at=submitted + timedelta(hours=6) if approved or rejected else None)

    categories = [data.add(f"category.{i}", "job_categories", "category_id",
        category_name=f"{name} · Demo", slug=f"demo-{slug}",
        description=f"Nhóm công việc {name.lower()} trong bộ dữ liệu demo.", is_active=True, sort_order=i)
        for i, (name, slug) in enumerate(CATEGORIES)]
    shifts = [data.add(f"shift.{i}", "work_shifts", "shift_id", shift_name=f"{name} · Demo",
        start_time=start, end_time=end, is_flexible=flexible, is_active=True, sort_order=i)
        for i, (name, start, end, flexible) in enumerate(SHIFTS)]

    addresses = [("Đà Nẵng", "Hải Châu", "Hải Châu", "Đường Minh Họa"),
                 ("Đà Nẵng", "Liên Chiểu", "Hòa Khánh", "Đường Sinh Viên"),
                 ("Đà Nẵng", "Sơn Trà", "An Hải", "Đường Biển Xanh"),
                 ("Đà Nẵng", "Cẩm Lệ", "Hòa Xuân", "Đường Nắng Mai"),
                 ("Hà Nội", "Cầu Giấy", "Dịch Vọng", "Đường Trang Sách"),
                 ("TP. Hồ Chí Minh", "Bình Thạnh", "Bình Thạnh", "Đường Vườn Phố")]
    for i in range(24):
        owner = i % 10
        city, district, ward, street = addresses[i % 6 if i % 3 == 0 else i % 4]
        stores.append(data.add(f"store.{i}", "stores", "store_id", employer_id=employers[owner],
            store_name=f"{COMPANIES[owner][0]} - {district} {i+1:02} [Demo]",
            phone_contact=f"09000002{i:02}", description="Chi nhánh minh họa cho kiểm thử tuyển dụng; địa chỉ không phải địa điểm kinh doanh thật.",
            city=city, district=district, ward=ward, street_address=f"{20+i*7} {street} (minh họa)",
            is_active=i < 16, is_approved=i < 20, cover_image_url=f"{asset_base}/store-{owner+1:02}.png",
            created_at=now - timedelta(days=60 - i), updated_at=now - timedelta(days=i % 7)))

    eligible_stores = [i for i in range(16) if i % 10 < 8]
    app_specs = []
    for i in range(120):
        status = "ACCEPTED" if i < 30 else "PENDING" if i < 85 else "REJECTED" if i < 110 else "WITHDRAWN"
        age = 80 + (i % 6) * 17 if status == "ACCEPTED" else 2 + (i * 7) % 55
        app_specs.append((i % 40, i % 44, status, now - timedelta(days=age, hours=i % 8)))

    job_store = []
    for i in range(80):
        store_index = eligible_stores[i % len(eligible_stores)]
        if 47 <= i <= 48:
            store_index = 8 + (i - 47)
        elif 49 <= i <= 50:
            store_index = 20 + (i - 49)
        elif i == 51:
            store_index = 16
        owner = store_index % 10
        job_store.append(store_index)
        role = CATEGORIES[i % 12][0]
        status = "ACTIVE" if i < 52 else "PAUSED" if i < 66 else "CLOSED" if i < 74 else "EXPIRED"
        prior_applications = [spec[3] for spec in app_specs if spec[1] == i]
        published = min(prior_applications) - timedelta(days=3) if prior_applications else now - timedelta(days=i % 30 + 1)
        if 44 <= i <= 46:
            published = now + timedelta(days=i - 42)
        deadline = now - timedelta(days=i - 73) if status == "EXPIRED" else now + timedelta(days=3 + i % 42)
        jobs.append(data.add(f"job.{i}", "job_posts", "job_post_id", employer_id=employers[owner], store_id=stores[store_index],
            title=f"{role} {'cuối tuần' if i % 4 == 0 else 'theo ca'} - {COMPANIES[owner][0]} [Demo {i+1:02}]",
            job_description=f"Tham gia đội ngũ {COMPANIES[owner][0]} ở vị trí {role.lower()}. "
                "Chuẩn bị khu vực làm việc, phối hợp cùng trưởng ca, hỗ trợ khách hàng và bàn giao cuối ca. "
                "Đây là tin giả lập dành riêng cho kiểm thử, không phải cơ hội tuyển dụng thật.",
            requirements="Từ 18 tuổi; đúng giờ, giao tiếp lịch sự, sẵn sàng học hỏi. Đăng ký tối thiểu 3 ca/tuần; ưu tiên lịch ổn định trong 2 tháng.",
            benefits="Đào tạo đầu vào, chủ động đăng ký ca học phù hợp, hỗ trợ bữa ăn và hướng dẫn công việc rõ ràng. Quyền lợi chỉ mang tính minh họa.",
            hourly_wage_min=23000 + i % 8 * 3000, hourly_wage_max=30000 + i % 8 * 3000,
            currency="VND", vacancy_count=2 + i % 6, min_age=18, max_age=35,
            gender_requirement="ANY", employment_type=["PART_TIME", "SHIFT_BASED", "SEASONAL", "INTERNSHIP"][i % 4],
            status=status, moderation_blocked=52 <= i < 57, published_at=published, expired_at=deadline,
            created_at=min(now, published - timedelta(days=1)), updated_at=min(now, published)))
        for c in sorted({i % 12, (i + 3) % 12}):
            data.add(f"job.{i}.category.{c}", "job_post_categories", None, job_post_id=jobs[-1], category_id=categories[c])
        for sh in sorted({i % 6, (i + 1) % 6}):
            data.add(f"job.{i}.shift.{sh}", "job_post_shifts", None, job_post_id=jobs[-1], shift_id=shifts[sh])
        for image_index in range(2):
            data.add(f"job.{i}.image.{image_index}", "job_post_images", "image_id", job_post_id=jobs[-1],
                image_url=f"{asset_base}/store-{(owner + image_index) % 10 + 1:02}.png", sort_order=image_index,
                uploaded_at=min(now, published))

    for i in range(35):
        pdf = (resume_dir / f"candidate-{i+1:02}.pdf").read_bytes() if resume_dir and i < 20 else None
        data.add(f"profile.{i}", "candidate_profiles", "id", user_id=users[i],
            summary=f"Tôi là {NAMES[i]}, đang tìm công việc bán thời gian phù hợp lịch học. Hồ sơ hoàn toàn giả lập.",
            skills=["Giao tiếp, làm việc nhóm, chăm sóc khách hàng", "Excel cơ bản, kiểm đếm và sắp xếp hàng hóa", "Pha chế cơ bản, vệ sinh và bàn giao ca"][i % 3],
            experience=f"{3 + i % 12} tháng tham gia hoạt động câu lạc bộ và hỗ trợ sự kiện sinh viên. Có thể làm tối và cuối tuần.",
            resume_data=pdf, resume_file_name=f"CV-demo-{i+1:02}.pdf" if i < 20 else None)
    for i in range(90):
        data.add(f"saved.{i}", "user_saved_jobs", "id", user_id=users[i % 40], job_post_id=jobs[(i * 7 + i // 40) % 80])

    for i, (candidate, job_index, status, applied) in enumerate(app_specs):
        applications.append(data.add(f"application.{i}", "job_applications", "application_id",
            job_post_id=jobs[job_index], applicant_user_id=users[candidate], contact_phone=f"09000003{candidate:02}",
            note="Có thể nhận ca tối và cuối tuần. Mong được trao đổi lịch làm phù hợp lịch học. [Demo]",
            rejection_reason="Lịch rảnh chưa phù hợp ca đang tuyển; cảm ơn bạn đã quan tâm. [Demo]" if status == "REJECTED" else None,
            status=status, applied_at=applied, updated_at=applied + timedelta(hours=12)))
        if status == "ACCEPTED":
            store_index = job_store[job_index]
            work_status = "WORKING" if i < 18 else "QUIT" if i < 26 else "TERMINATED"
            start = applied.date() + timedelta(days=7)
            employments.append(data.add(f"employment.{i}", "employment_records", "employment_record_id",
                user_id=users[candidate], store_id=stores[store_index], job_post_id=jobs[job_index], application_id=applications[-1],
                start_date=start, end_date=start + timedelta(days=35) if work_status != "WORKING" else None,
                work_status=work_status, verified_by_employer_id=employers[store_index % 10], verified_at=applied + timedelta(days=1),
                note="Nhân sự demo đang làm." if work_status == "WORKING" else "Kết thúc việc làm minh họa; giữ nguyên lịch sử.",
                created_at=applied + timedelta(hours=12)))

    for i in range(20):
        candidate, job_index, _, applied = app_specs[i]
        data.add(f"review.{i}", "store_reviews", "review_id", store_id=stores[job_store[job_index]],
            reviewer_user_id=users[candidate], employment_record_id=employments[i], rating=3 + i % 3,
            comment=["Trưởng ca hướng dẫn rõ, lịch làm phù hợp việc học.", "Đồng nghiệp hỗ trợ tốt, mong thời gian bàn giao được linh hoạt hơn.", "Môi trường gọn gàng, công việc đúng mô tả."][i % 3] + " [Đánh giá giả lập]",
            status="VISIBLE" if i < 16 else "HIDDEN", created_at=applied + timedelta(days=25), updated_at=applied + timedelta(days=26))

    for i in range(50):
        app_index = 30 + i % 55
        candidate, job_index, _, applied = app_specs[app_index]
        owner = job_store[job_index] % 10
        from_candidate = i % 2 == 0
        data.add(f"message.{i}", "recruitment_interactions", "id", application_id=applications[app_index], job_post_id=jobs[job_index],
            author_id=users[candidate] if from_candidate else employer_users[owner],
            recipient_id=employer_users[owner] if from_candidate else users[candidate], kind="MESSAGE", status="OPEN",
            body=("Em có thể làm ca tối thứ 3, 5 và cuối tuần. Anh/chị cho em biết lịch trao đổi nhé." if from_candidate else
                  "Cảm ơn bạn. Cửa hàng đã nhận hồ sơ và sẽ trao đổi lịch phù hợp qua cuộc trò chuyện này.") + " [Demo]",
            created_at=applied + timedelta(hours=18))
    for i in range(20):
        app_index = 30 + i
        candidate, job_index, _, _ = app_specs[app_index]
        owner = job_store[job_index] % 10
        status = ["OPEN", "ACCEPTED", "DECLINED", "CANCELLED"][i % 4]
        data.add(f"interview.{i}", "recruitment_interactions", "id", application_id=applications[app_index], job_post_id=jobs[job_index],
            author_id=employer_users[owner], recipient_id=users[candidate], kind="INTERVIEW", status=status,
            body="Trao đổi trực tiếp tại cửa hàng khoảng 20 phút, mang theo lịch rảnh của bạn. Lịch hẹn giả lập.",
            meeting_at=now + timedelta(days=2 + i % 10, hours=i % 5), created_at=now - timedelta(hours=16))
    for i in range(18):
        data.add(f"report.{i}", "recruitment_interactions", "id", author_id=users[10+i], job_post_id=jobs[i * 3 % 44],
            kind="REPORT", status="OPEN" if i < 12 else "RESOLVED",
            body=["Đề nghị kiểm tra lại địa chỉ được mô tả trong tin.", "Mức lương và quyền lợi cần được trình bày rõ hơn.", "Cần xác minh thông tin ca làm với cửa hàng."][i % 3] + " [Báo cáo giả lập]",
            created_at=now - timedelta(days=1 + i % 10))
    decided = list(range(30)) + list(range(85, 110))
    for i in range(80):
        app_index = decided[i] if i < 55 else 30 + (i - 55)
        candidate, job_index, status, applied = app_specs[app_index]
        recipient = users[candidate] if i < 55 else employer_users[job_store[job_index] % 10]
        message = "Đơn ứng tuyển đã được chấp nhận." if status == "ACCEPTED" else "Đơn ứng tuyển bị từ chối; vui lòng xem lý do." if status == "REJECTED" else "Có đơn ứng tuyển mới cần xem xét."
        created = applied + timedelta(hours=12)
        data.add(f"notification.{i}", "user_notifications", "id", user_id=recipient, application_id=applications[app_index],
            message=message + " [Demo]", created_at=created, read_at=created + timedelta(hours=1) if i % 3 == 0 else None)
    validate_dataset(data, now)
    return data


def validate_dataset(data, now):
    """Reject broken fixture relationships before generating SQL."""
    by_key = {record.key: record for record in data.records}
    for record in data.records:
        for value in record.values.values():
            if isinstance(value, Ref) and value.key not in by_key:
                raise ValueError(f"Unresolved reference: {record.key} -> {value.key}")
    applications = [r for r in data.records if r.table == "job_applications"]
    pairs = [(r.values["applicant_user_id"], r.values["job_post_id"]) for r in applications]
    if len(set(pairs)) != len(pairs):
        raise ValueError("Duplicate applications")
    for record in (r for r in data.records if r.table == "employment_records"):
        application = by_key[record.values["application_id"].key]
        if application.values["status"] != "ACCEPTED":
            raise ValueError("Employment requires an accepted application")
        if record.values["user_id"] != application.values["applicant_user_id"]:
            raise ValueError("Employment owner mismatch")
    for record in (r for r in data.records if r.table == "store_reviews"):
        employment = by_key[record.values["employment_record_id"].key]
        if record.values["reviewer_user_id"] != employment.values["user_id"]:
            raise ValueError("Review owner mismatch")
        if employment.values["start_date"] > now.date() or not employment.values["verified_at"]:
            raise ValueError("Review requires verified work that has begun")
    for record in (r for r in data.records if r.table == "job_posts"):
        if record.values["hourly_wage_min"] > record.values["hourly_wage_max"]:
            raise ValueError("Invalid wage interval")
        store = by_key[record.values["store_id"].key]
        if record.values["employer_id"] != store.values["employer_id"]:
            raise ValueError("Job and store employer mismatch")

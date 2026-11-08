-- Normalize shared reference labels for production and development.
UPDATE job_categories SET category_name='Phục vụ',description='Shared job category' WHERE slug='phuc-vu';
UPDATE job_categories SET category_name='Pha chế',description='Shared job category' WHERE slug='pha-che';
UPDATE job_categories SET category_name='Thu ngân',description='Shared job category' WHERE slug='thu-ngan';
UPDATE job_categories SET category_name='Bán hàng',description='Shared job category' WHERE slug='ban-hang';
UPDATE job_categories SET category_name='Phụ bếp',description='Shared job category' WHERE slug='phu-bep';
UPDATE job_categories SET category_name='Kho hàng',description='Shared job category' WHERE slug='kho-hang';
UPDATE job_categories SET category_name='Đóng gói',description='Shared job category' WHERE slug='dong-goi';
UPDATE job_categories SET category_name='Hỗ trợ sự kiện',description='Shared job category' WHERE slug='ho-tro-su-kien';
UPDATE job_categories SET category_name='Chăm sóc khách hàng',description='Shared job category' WHERE slug='cham-soc-khach-hang';
UPDATE job_categories SET category_name='Gia sư',description='Shared job category' WHERE slug='gia-su';
UPDATE job_categories SET category_name='Nội dung số',description='Shared job category' WHERE slug='noi-dung-so';
UPDATE job_categories SET category_name='Hành chính',description='Shared job category' WHERE slug='hanh-chinh';
UPDATE work_shifts SET shift_name='Ca sáng' WHERE shift_name='Ca sáng · Demo';
UPDATE work_shifts SET shift_name='Ca chiều' WHERE shift_name='Ca chiều · Demo';
UPDATE work_shifts SET shift_name='Ca tối' WHERE shift_name='Ca tối · Demo';
UPDATE work_shifts SET shift_name='Cuối tuần' WHERE shift_name='Cuối tuần · Demo';
UPDATE work_shifts SET shift_name='Linh hoạt' WHERE shift_name='Linh hoạt · Demo';
UPDATE work_shifts SET shift_name='Qua đêm' WHERE shift_name='Qua đêm · Demo';

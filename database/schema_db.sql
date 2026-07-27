DROP DATABASE IF EXISTS parttime_hiring_platform;

CREATE DATABASE parttime_hiring_platform
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE parttime_hiring_platform;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    display_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    avatar_url VARCHAR(500),
    dob DATE
);

CREATE TABLE user_oauth_accounts (
    oauth_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (provider, provider_account_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE role (
    role_name VARCHAR(255) PRIMARY KEY,
    description VARCHAR(255)
);

CREATE TABLE permission (
    permission_name VARCHAR(255) PRIMARY KEY,
    description VARCHAR(255)
);

CREATE TABLE user_roles (
    user_id INT NOT NULL,
    role_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id, role_name),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (role_name) REFERENCES role(role_name)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE role_permissions (
    role_name VARCHAR(255) NOT NULL,
    permission_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (role_name, permission_name),
    FOREIGN KEY (role_name) REFERENCES role(role_name)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (permission_name) REFERENCES permission(permission_name)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE invalidated_token (
    jti VARCHAR(255) PRIMARY KEY,
    expiry_time DATETIME NOT NULL
);

CREATE TABLE email_verification_otps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expiration_time DATETIME NOT NULL,
    is_used BOOLEAN DEFAULT FALSE
);

CREATE TABLE employers (
    employer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(255),
    email_contact VARCHAR(255),
    phone_contact VARCHAR(255),
    description TEXT,
    website VARCHAR(255),
    tax_code VARCHAR(255),
    representative_name VARCHAR(255),
    status VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

CREATE TABLE employer_verifications (
    verification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    admin_id INT,
    contact_email VARCHAR(255) NOT NULL,
    phone_contact VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    representative_name VARCHAR(255) NOT NULL,
    store_front_image_url VARCHAR(500) NOT NULL,
    store_front_image_public_id VARCHAR(255),
    tax_code VARCHAR(255),
    business_license_url VARCHAR(500),
    business_license_public_id VARCHAR(255),
    website_fanpage_url VARCHAR(255),
    id_card_front_url VARCHAR(500) NOT NULL,
    id_card_front_public_id VARCHAR(255),
    id_card_back_url VARCHAR(500) NOT NULL,
    id_card_back_public_id VARCHAR(255),
    verification_status VARCHAR(255) NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verified_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE SET NULL,
    CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

CREATE TABLE stores (
    store_id INT AUTO_INCREMENT PRIMARY KEY,
    employer_id INT NOT NULL,
    store_name VARCHAR(255) NOT NULL,
    phone_contact VARCHAR(255),
    description TEXT,
    city VARCHAR(255) NOT NULL,
    district VARCHAR(255),
    ward VARCHAR(255),
    street_address VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES employers(employer_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE job_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE work_shifts (
    shift_id INT AUTO_INCREMENT PRIMARY KEY,
    shift_name VARCHAR(255) NOT NULL UNIQUE,
    start_time TIME,
    end_time TIME
);

CREATE TABLE job_posts (
    job_post_id INT AUTO_INCREMENT PRIMARY KEY,
    employer_id INT NOT NULL,
    store_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    job_description TEXT NOT NULL,
    requirements TEXT,
    benefits TEXT,
    hourly_wage_min DECIMAL(10,2) NOT NULL,
    hourly_wage_max DECIMAL(10,2),
    currency VARCHAR(255) NOT NULL DEFAULT 'VND',
    vacancy_count INT NOT NULL DEFAULT 1,
    min_age INT,
    max_age INT,
    gender_requirement VARCHAR(255) NOT NULL,
    employment_type VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    published_at DATETIME,
    expired_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (employer_id) REFERENCES employers(employer_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(store_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CHECK (vacancy_count >= 0),
    CHECK (hourly_wage_max IS NULL OR hourly_wage_max >= hourly_wage_min),
    CHECK (gender_requirement IN ('ANY', 'MALE', 'FEMALE')),
    CHECK (employment_type IN ('PART_TIME', 'FULL_TIME', 'TEMPORARY')),
    CHECK (status IN ('DRAFT', 'ACTIVE', 'CLOSED', 'EXPIRED')),
    CHECK (
        (min_age IS NULL OR min_age >= 0)
        AND (max_age IS NULL OR max_age >= 0)
        AND (max_age IS NULL OR min_age IS NULL OR max_age >= min_age)
    )
);

CREATE TABLE job_post_categories (
    job_post_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (job_post_id, category_id),
    FOREIGN KEY (job_post_id) REFERENCES job_posts(job_post_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (category_id) REFERENCES job_categories(category_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE job_post_shifts (
    job_post_id INT NOT NULL,
    shift_id INT NOT NULL,
    PRIMARY KEY (job_post_id, shift_id),
    FOREIGN KEY (job_post_id) REFERENCES job_posts(job_post_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (shift_id) REFERENCES work_shifts(shift_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE job_post_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    job_post_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    FOREIGN KEY (job_post_id) REFERENCES job_posts(job_post_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE job_applications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    job_post_id INT NOT NULL,
    applicant_user_id INT NOT NULL,
    contact_phone VARCHAR(255),
    cover_letter TEXT,
    status VARCHAR(255) NOT NULL,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE (job_post_id, applicant_user_id),

    FOREIGN KEY (job_post_id) REFERENCES job_posts(job_post_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (applicant_user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CHECK (status IN ('PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED'))
);

CREATE TABLE employment_records (
    employment_record_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    store_id INT NOT NULL,
    job_post_id INT,
    application_id INT UNIQUE,
    start_date DATE,
    end_date DATE,
    work_status VARCHAR(255) NOT NULL,
    verified_by_employer_id INT,
    verified_at DATETIME,
    note TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(store_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (job_post_id) REFERENCES job_posts(job_post_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (application_id) REFERENCES job_applications(application_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (verified_by_employer_id) REFERENCES employers(employer_id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    CHECK (work_status IN ('WORKING', 'RESIGNED', 'FIRED')),
    CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE TABLE store_reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    reviewer_user_id INT NOT NULL,
    employment_record_id INT NOT NULL UNIQUE,
    rating INT NOT NULL,
    comment TEXT,
    status VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (store_id) REFERENCES stores(store_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (reviewer_user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (employment_record_id) REFERENCES employment_records(employment_record_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CHECK (rating BETWEEN 1 AND 5),
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

INSERT INTO permission(permission_name, description) VALUES
('USER_READ', 'View user information'),
('USER_UPDATE', 'Update user profile'),

('JOB_VIEW', 'View job posts'),
('JOB_CREATE', 'Create job posts'),
('JOB_UPDATE', 'Update job posts'),
('JOB_DELETE', 'Delete job posts'),

('APPLICATION_CREATE', 'Apply for jobs'),
('APPLICATION_VIEW', 'View applications'),
('APPLICATION_UPDATE_STATUS', 'Accept or reject applications'),

('STORE_VIEW', 'View store information'),
('STORE_CREATE', 'Create stores'),
('STORE_UPDATE', 'Update store information'),

('CATEGORY_VIEW', 'View job categories'),
('CATEGORY_MANAGE', 'Manage job categories'),

('SHIFT_VIEW', 'View work shifts'),
('SHIFT_MANAGE', 'Manage work shifts'),

('REVIEW_CREATE', 'Create reviews'),
('REVIEW_VIEW', 'View reviews'),
('REVIEW_MODERATE', 'Moderate reviews'),

('EMPLOYER_APPROVE', 'Approve employers'),

('ROLE_ASSIGN', 'Assign roles to users');

# Part-time Hiring Platform

A full-stack recruitment platform that connects job seekers with employers for part-time job opportunities. The system enables candidates to search and apply for jobs while allowing employers to manage stores, job postings, and applications through a centralized dashboard. 

*(Note: Some features listed below are currently under active development and will be completed in upcoming updates).*

---

## Features

### Authentication & Authorization
* JWT-based authentication
* Role-Based Access Control (RBAC)
* Google OAuth Login
* Spring Security integration

### Employer Management
* Employer registration and verification
* OTP email verification workflow
* Employer profile management
* Verification approval process

### Store Management
* Create and manage multiple stores
* Store information management
* Store media upload
* Store status tracking

### Job Management
* Create, update, and delete job posts
* Job categories and work shifts
* Job image management
* Job status management (Active, Closed, Expired)

### Application Management
* Apply for jobs
* Track application status
* Employer review and processing
* Hiring history management

### AI-Powered Moderation
* Validate job posts against employer profiles
* Detect fraudulent recruitment content
* Prevent unauthorized store creation
* Improve recruitment quality and trustworthiness

### Review System
* Store reviews and ratings
* Employment record verification
* Review moderation

---

## Technology Stack

### Backend
* Java 21
* Spring Boot
* Spring Security
* Spring Data JPA (Hibernate)
* JWT Authentication

### Frontend
* React 18
* TypeScript
* Vite

### Database
* MySQL

### Cloud Services
* Cloudinary

### DevOps
* Docker
* Git
* GitHub

### Authentication
* Google OAuth 2.0
* Email OTP Verification

---

## Database Design

**Main entities:**
* Users, Roles, Permissions
* Employers, Employer Verifications
* Stores
* Job Categories, Work Shifts, Job Posts
* Job Applications
* Employment Records
* Store Reviews

**Relationships:**
* One Employer → Many Stores
* One Store → Many Job Posts
* One Job Post → Many Applications
* One User → Many Applications

<details>
<summary><b>Click to view full Database Schema (DBML)</b></summary>

You can copy the code below and paste it into [dbdiagram.io](https://dbdiagram.io/d) to instantly generate an Entity Relationship Diagram (ERD).

```dbml
// ==========================================
// THỰC THỂ NGƯỜI DÙNG & PHÂN QUYỀN
// ==========================================
Table users {
  user_id int [primary key, increment]
  username varchar [unique]
  password varchar
  display_name varchar [not null]
  email varchar [unique]
  avatar_url varchar
  dob date
}

Table user_oauth_accounts {
  oauth_id int [primary key, increment]
  user_id int [not null, ref: > users.user_id]
  provider varchar [not null]
  provider_account_id varchar [not null]
  created_at datetime [not null]
}

Table roles {
  role_name varchar [primary key]
  description varchar
}

Table permissions {
  permission_name varchar [primary key]
  description varchar
}

Table user_roles {
  user_id int [ref: > users.user_id]
  role_name varchar [ref: > roles.role_name]
}

Table role_permissions {
  role_name varchar [ref: > roles.role_name]
  permission_name varchar [ref: > permissions.permission_name]
}

Table invalidated_tokens {
  jti varchar [primary key]
  expiry_time datetime [not null]
}

Table email_verification_otps {
  id bigint [primary key, increment]
  email varchar [not null]
  otp_code varchar(6) [not null]
  expiration_time datetime [not null]
  is_used boolean [default: false]
}

// ==========================================
// THỰC THỂ NHÀ TUYỂN DỤNG & CỬA HÀNG
// ==========================================
Table employers {
  employer_id int [primary key, increment]
  user_id int [unique, not null, ref: - users.user_id]
  company_name varchar [not null]
  business_type varchar
  email_contact varchar
  phone_contact varchar
  description text
  website varchar
  tax_code varchar
  representative_name varchar
  status enum_employer_status [not null, note: 'PENDING, APPROVED, REJECTED']
  created_at datetime
  updated_at datetime
}

Table employer_verifications {
  verification_id int [primary key, increment]
  user_id int [not null, ref: > users.user_id]
  admin_id int [ref: > users.user_id]
  contact_email varchar [not null]
  phone_contact varchar [not null]
  address varchar [not null]
  company_name varchar [not null]
  representative_name varchar [not null]
  store_front_image_url varchar [not null]
  store_front_image_public_id varchar
  tax_code varchar
  business_license_url varchar
  business_license_public_id varchar
  website_fanpage_url varchar
  id_card_front_url varchar [not null]
  id_card_front_public_id varchar
  id_card_back_url varchar [not null]
  id_card_back_public_id varchar
  verification_status enum_verification_status [not null, default: 'PENDING']
  rejection_reason text
  submitted_at datetime [not null]
  verified_at datetime
}

Table stores {
  store_id int [primary key, increment]
  employer_id int [not null, ref: > employers.employer_id]
  store_name varchar [not null]
  phone_contact varchar
  description text
  city varchar [not null]
  district varchar
  ward varchar
  street_address varchar
  is_active boolean [not null, default: true]
  created_at datetime
  updated_at datetime
}

Table store_reviews {
  review_id int [primary key, increment]
  store_id int [not null, ref: > stores.store_id]
  reviewer_user_id int [not null, ref: > users.user_id]
  employment_record_id int [unique, not null, ref: - employment_records.employment_record_id]
  rating int [not null]
  comment text
  status enum_review_status [not null, note: 'PENDING, APPROVED, REJECTED']
  created_at datetime
  updated_at datetime
}

// ==========================================
// THỰC THỂ CÔNG VIỆC (JOB)
// ==========================================
Table job_posts {
  job_post_id int [primary key, increment]
  employer_id int [not null, ref: > employers.employer_id]
  store_id int [not null, ref: > stores.store_id]
  title varchar [not null]
  job_description text [not null]
  requirements text
  benefits text
  hourly_wage_min decimal [not null]
  hourly_wage_max decimal
  currency varchar [not null, default: 'VND']
  vacancy_count int [not null, default: 1]
  min_age int
  max_age int
  gender_requirement enum_gender_req [not null, note: 'ANY, MALE, FEMALE']
  employment_type enum_emp_type [not null, note: 'PART_TIME, FULL_TIME, TEMPORARY']
  status enum_job_status [not null, note: 'DRAFT, ACTIVE, CLOSED, EXPIRED']
  published_at datetime
  expired_at datetime
  created_at datetime
  updated_at datetime
}

Table job_post_images {
  image_id int [primary key, increment]
  job_post_id int [not null, ref: > job_posts.job_post_id]
  image_url varchar [not null]
}

Table job_categories {
  category_id int [primary key, increment]
  category_name varchar [unique, not null]
  slug varchar [unique, not null]
}

Table job_post_categories {
  job_post_id int [not null, ref: > job_posts.job_post_id]
  category_id int [not null, ref: > job_categories.category_id]
}

Table work_shifts {
  shift_id int [primary key, increment]
  shift_name varchar [unique, not null]
  start_time time
  end_time time
}

Table job_post_shifts {
  job_post_id int [not null, ref: > job_posts.job_post_id]
  shift_id int [not null, ref: > work_shifts.shift_id]
}

// ==========================================
// THỰC THỂ ỨNG TUYỂN & HỒ SƠ VIỆC LÀM
// ==========================================
Table job_applications {
  application_id int [primary key, increment]
  job_post_id int [not null, ref: > job_posts.job_post_id]
  applicant_user_id int [not null, ref: > users.user_id]
  contact_phone varchar
  cover_letter text
  status enum_app_status [not null, note: 'PENDING, REVIEWING, ACCEPTED, REJECTED']
  applied_at datetime [not null]
  updated_at datetime [not null]
}

Table employment_records {
  employment_record_id int [primary key, increment]
  user_id int [not null, ref: > users.user_id]
  store_id int [not null, ref: > stores.store_id]
  job_post_id int [ref: > job_posts.job_post_id]
  application_id int [unique, ref: - job_applications.application_id]
  start_date date
  end_date date
  work_status enum_work_status [not null, note: 'WORKING, RESIGNED, FIRED']
  verified_by_employer_id int [ref: > employers.employer_id]
  verified_at datetime
  note text
  created_at datetime [not null]
}
```
</details>
* One Employment Record → One Review

---

## System Roles

### User
* Search jobs
* Apply for jobs
* Track applications
* Review workplaces

### Employer
* Verify business account
* Manage stores
* Create job posts
* Process applications

### Admin
* Manage users
* Approve employer verification
* Moderate job posts
* Monitor platform activities

---

## AI Moderation Workflow

1. Employer creates a store and job post.
2. AI analyzes:
   * Employer profile
   * Store information
   * Job title
   * Job description
3. If inconsistencies are detected:
   * Job post is flagged or rejected.
4. Valid job posts are published.

*Example:*
* **Verified Employer:** Highlands Coffee
* **Submitted Store:** Starbucks Coffee
* **Result:** AI flags the post as suspicious and prevents publication.

---

## Project Structure

```text
.
├── ParttimeHiringBackend    # Java Spring Boot API service
├── ParttimeHiringFrontend   # React Vite web application
├── database                 # Database schemas             
└── README.md                # Project overview (this file)
```

---

## Deployment

### Run with Docker

```bash
docker-compose up -d
```

### Run Spring Boot

```bash
cd ParttimeHiringBackend
./mvnw spring-boot:run
```

### Run Frontend Development Server

```bash
cd ParttimeHiringFrontend
npm install
npm run dev
```

---

## Future Improvements

* Resume/CV Upload
* AI Candidate Recommendation
* AI Job Matching
* Real-time Notifications
* Interview Scheduling
* Analytics Dashboard
* Mobile Application

---

## Author

**Ho Si Tan**  
Software Engineering Student  
FPT University Da Nang

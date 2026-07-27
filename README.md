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
<summary><b>Click to view visual Database ER Diagram</b></summary>

```mermaid
erDiagram
    users {
        int user_id PK
        varchar username UK
        varchar password
        varchar display_name
        varchar email UK
        varchar avatar_url
        date dob
    }

    user_oauth_accounts {
        int oauth_id PK
        int user_id FK
        varchar provider
        varchar provider_account_id
        datetime created_at
    }

    roles {
        varchar role_name PK
        varchar description
    }

    permissions {
        varchar permission_name PK
        varchar description
    }

    user_roles {
        int user_id FK
        varchar role_name FK
    }

    role_permissions {
        varchar role_name FK
        varchar permission_name FK
    }

    invalidated_tokens {
        varchar jti PK
        datetime expiry_time
    }

    email_verification_otps {
        bigint id PK
        varchar email
        varchar otp_code
        datetime expiration_time
        boolean is_used
    }

    employers {
        int employer_id PK
        int user_id FK
        varchar company_name
        varchar business_type
        varchar email_contact
        varchar phone_contact
        text description
        varchar website
        varchar tax_code
        varchar representative_name
        varchar status
        datetime created_at
        datetime updated_at
    }

    employer_verifications {
        int verification_id PK
        int user_id FK
        int admin_id FK
        varchar contact_email
        varchar phone_contact
        varchar address
        varchar company_name
        varchar representative_name
        varchar store_front_image_url
        varchar store_front_image_public_id
        varchar tax_code
        varchar business_license_url
        varchar business_license_public_id
        varchar website_fanpage_url
        varchar id_card_front_url
        varchar id_card_front_public_id
        varchar id_card_back_url
        varchar id_card_back_public_id
        varchar verification_status
        text rejection_reason
        datetime submitted_at
        datetime verified_at
    }

    stores {
        int store_id PK
        int employer_id FK
        varchar store_name
        varchar phone_contact
        text description
        varchar city
        varchar district
        varchar ward
        varchar street_address
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    store_reviews {
        int review_id PK
        int store_id FK
        int reviewer_user_id FK
        int employment_record_id FK
        int rating
        text comment
        varchar status
        datetime created_at
        datetime updated_at
    }

    job_posts {
        int job_post_id PK
        int employer_id FK
        int store_id FK
        varchar title
        text job_description
        text requirements
        text benefits
        decimal hourly_wage_min
        decimal hourly_wage_max
        varchar currency
        int vacancy_count
        int min_age
        int max_age
        varchar gender_requirement
        varchar employment_type
        varchar status
        datetime published_at
        datetime expired_at
        datetime created_at
        datetime updated_at
    }

    job_post_images {
        int image_id PK
        int job_post_id FK
        varchar image_url
    }

    job_categories {
        int category_id PK
        varchar category_name UK
        varchar slug UK
    }

    job_post_categories {
        int job_post_id FK
        int category_id FK
    }

    work_shifts {
        int shift_id PK
        varchar shift_name UK
        time start_time
        time end_time
    }

    job_post_shifts {
        int job_post_id FK
        int shift_id FK
    }

    job_applications {
        int application_id PK
        int job_post_id FK
        int applicant_user_id FK
        varchar contact_phone
        text cover_letter
        varchar status
        datetime applied_at
        datetime updated_at
    }

    employment_records {
        int employment_record_id PK
        int user_id FK
        int store_id FK
        int job_post_id FK
        int application_id FK
        date start_date
        date end_date
        varchar work_status
        int verified_by_employer_id FK
        datetime verified_at
        text note
        datetime created_at
    }

    users ||--o{ user_oauth_accounts : "has"
    users ||--o{ user_roles : "has"
    roles ||--o{ user_roles : "assigned to"
    roles ||--o{ role_permissions : "has"
    permissions ||--o{ role_permissions : "assigned to"
    users ||--o| employers : "acts as"
    users ||--o{ employer_verifications : "submits"
    users ||--o{ employer_verifications : "verifies"
    employers ||--o{ stores : "owns"
    users ||--o{ store_reviews : "writes"
    stores ||--o{ store_reviews : "receives"
    employment_records ||--o| store_reviews : "has"
    employers ||--o{ job_posts : "creates"
    stores ||--o{ job_posts : "hosts"
    job_posts ||--o{ job_post_images : "contains"
    job_posts ||--o{ job_post_categories : "has"
    job_categories ||--o{ job_post_categories : "assigned to"
    job_posts ||--o{ job_post_shifts : "has"
    work_shifts ||--o{ job_post_shifts : "assigned to"
    job_posts ||--o{ job_applications : "receives"
    users ||--o{ job_applications : "applies"
    users ||--o{ employment_records : "works"
    stores ||--o{ employment_records : "employs"
    job_posts ||--o{ employment_records : "for"
    job_applications ||--o| employment_records : "results in"
    employers ||--o{ employment_records : "verifies"
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

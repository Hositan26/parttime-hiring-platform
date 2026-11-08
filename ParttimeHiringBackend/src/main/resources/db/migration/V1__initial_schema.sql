-- Canonical MySQL 8 schema. Hibernate validates; Flyway owns DDL.
SET FOREIGN_KEY_CHECKS=0;
CREATE TABLE `auth_password_resets` (
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`token_hash`),
  KEY `FKhnh9thf0wregmfrgqy0b4bgj5` (`user_id`),
  CONSTRAINT `FKhnh9thf0wregmfrgqy0b4bgj5` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `auth_refresh_sessions` (
  `token_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `consumed` bit(1) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `family` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `revoked` bit(1) NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`token_hash`),
  KEY `FKjl9ef17f2yf2snk9uc5kfs9tn` (`user_id`),
  CONSTRAINT `FKjl9ef17f2yf2snk9uc5kfs9tn` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `auth_revoked_access_tokens` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `candidate_profiles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `experience` varchar(5000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resume_data` longblob,
  `resume_file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `skills` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `summary` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKm7asead9kaplln9cdupjat1cq` (`user_id`),
  CONSTRAINT `FKn7b2se0y378uox9e3aw2bjg13` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `email_verification_otps` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp_code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration_time` datetime NOT NULL,
  `is_used` tinyint(1) DEFAULT '0',
  `attempts` int NOT NULL DEFAULT '0',
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `owner_user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKejo6757lfghyd2244r4ov4q7j` (`owner_user_id`),
  CONSTRAINT `FKejo6757lfghyd2244r4ov4q7j` FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `employer_verifications` (
  `verification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `admin_id` int DEFAULT NULL,
  `contact_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_contact` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `representative_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `store_front_image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `store_front_image_public_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `business_license_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `business_license_public_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website_fanpage_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_card_front_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_card_front_public_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_card_back_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_card_back_public_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verification_status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `submitted_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `verified_at` datetime DEFAULT NULL,
  PRIMARY KEY (`verification_id`),
  KEY `user_id` (`user_id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `employer_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `employer_verifications_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `employer_verifications_chk_1` CHECK ((`verification_status` in (_utf8mb4'PENDING',_utf8mb4'APPROVED',_utf8mb4'REJECTED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `employers` (
  `employer_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_contact` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_contact` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `representative_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`employer_id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `employers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `employers_chk_1` CHECK ((`status` in (_latin1'ACTIVE',_latin1'INACTIVE',_latin1'SUSPENDED',_latin1'PENDING_VERIFICATION')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `employment_records` (
  `employment_record_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `store_id` int NOT NULL,
  `job_post_id` int DEFAULT NULL,
  `application_id` int DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `work_status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `verified_by_employer_id` int DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`employment_record_id`),
  UNIQUE KEY `application_id` (`application_id`),
  KEY `user_id` (`user_id`),
  KEY `store_id` (`store_id`),
  KEY `job_post_id` (`job_post_id`),
  KEY `verified_by_employer_id` (`verified_by_employer_id`),
  CONSTRAINT `employment_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `employment_records_ibfk_2` FOREIGN KEY (`store_id`) REFERENCES `stores` (`store_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `employment_records_ibfk_3` FOREIGN KEY (`job_post_id`) REFERENCES `job_posts` (`job_post_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `employment_records_ibfk_4` FOREIGN KEY (`application_id`) REFERENCES `job_applications` (`application_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `employment_records_ibfk_5` FOREIGN KEY (`verified_by_employer_id`) REFERENCES `employers` (`employer_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ck_employment_records_work_status_current` CHECK ((`work_status` in (_utf8mb4'WORKING',_utf8mb4'QUIT',_utf8mb4'TERMINATED'))),
  CONSTRAINT `employment_records_chk_2` CHECK (((`end_date` is null) or (`start_date` is null) or (`end_date` >= `start_date`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `job_applications` (
  `application_id` int NOT NULL AUTO_INCREMENT,
  `job_post_id` int NOT NULL,
  `applicant_user_id` int NOT NULL,
  `contact_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cover_letter` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applied_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `note` text COLLATE utf8mb4_unicode_ci,
  `rejection_reason` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`application_id`),
  UNIQUE KEY `job_post_id` (`job_post_id`,`applicant_user_id`),
  KEY `applicant_user_id` (`applicant_user_id`),
  CONSTRAINT `job_applications_ibfk_1` FOREIGN KEY (`job_post_id`) REFERENCES `job_posts` (`job_post_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `job_applications_ibfk_2` FOREIGN KEY (`applicant_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ck_job_applications_status_current` CHECK ((`status` in (_utf8mb4'PENDING',_utf8mb4'ACCEPTED',_utf8mb4'REJECTED',_utf8mb4'WITHDRAWN')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `job_categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` bit(1) NOT NULL,
  `sort_order` int NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `job_post_categories` (
  `job_post_id` int NOT NULL,
  `category_id` int NOT NULL,
  PRIMARY KEY (`job_post_id`,`category_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `job_post_categories_ibfk_1` FOREIGN KEY (`job_post_id`) REFERENCES `job_posts` (`job_post_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `job_post_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `job_categories` (`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `job_post_images` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `job_post_id` int NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL,
  `uploaded_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`image_id`),
  KEY `job_post_id` (`job_post_id`),
  CONSTRAINT `job_post_images_ibfk_1` FOREIGN KEY (`job_post_id`) REFERENCES `job_posts` (`job_post_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `job_post_shifts` (
  `job_post_id` int NOT NULL,
  `shift_id` int NOT NULL,
  PRIMARY KEY (`job_post_id`,`shift_id`),
  KEY `shift_id` (`shift_id`),
  CONSTRAINT `job_post_shifts_ibfk_1` FOREIGN KEY (`job_post_id`) REFERENCES `job_posts` (`job_post_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `job_post_shifts_ibfk_2` FOREIGN KEY (`shift_id`) REFERENCES `work_shifts` (`shift_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `job_posts` (
  `job_post_id` int NOT NULL AUTO_INCREMENT,
  `employer_id` int NOT NULL,
  `store_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `job_description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `requirements` text COLLATE utf8mb4_unicode_ci,
  `benefits` text COLLATE utf8mb4_unicode_ci,
  `hourly_wage_min` decimal(38,2) NOT NULL,
  `hourly_wage_max` decimal(38,2) DEFAULT NULL,
  `currency` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'VND',
  `vacancy_count` int NOT NULL DEFAULT '1',
  `min_age` int DEFAULT NULL,
  `max_age` int DEFAULT NULL,
  `gender_requirement` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employment_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `published_at` datetime DEFAULT NULL,
  `expired_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `moderation_blocked` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`job_post_id`),
  KEY `employer_id` (`employer_id`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `job_posts_ibfk_1` FOREIGN KEY (`employer_id`) REFERENCES `employers` (`employer_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `job_posts_ibfk_2` FOREIGN KEY (`store_id`) REFERENCES `stores` (`store_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ck_job_posts_employment_type_current` CHECK ((`employment_type` in (_utf8mb4'PART_TIME',_utf8mb4'FULL_TIME',_utf8mb4'SHIFT_BASED',_utf8mb4'SEASONAL',_utf8mb4'INTERNSHIP'))),
  CONSTRAINT `ck_job_posts_status_current` CHECK ((`status` in (_utf8mb4'ACTIVE',_utf8mb4'PAUSED',_utf8mb4'CLOSED',_utf8mb4'EXPIRED'))),
  CONSTRAINT `job_posts_chk_1` CHECK ((`vacancy_count` >= 0)),
  CONSTRAINT `job_posts_chk_2` CHECK (((`hourly_wage_max` is null) or (`hourly_wage_max` >= `hourly_wage_min`))),
  CONSTRAINT `job_posts_chk_3` CHECK ((`gender_requirement` in (_utf8mb4'ANY',_utf8mb4'MALE',_utf8mb4'FEMALE'))),
  CONSTRAINT `job_posts_chk_6` CHECK ((((`min_age` is null) or (`min_age` >= 0)) and ((`max_age` is null) or (`max_age` >= 0)) and ((`max_age` is null) or (`min_age` is null) or (`max_age` >= `min_age`))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `recruitment_interactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `body` varchar(2000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `kind` enum('INTERVIEW','MESSAGE','REPORT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `meeting_at` datetime(6) DEFAULT NULL,
  `status` enum('ACCEPTED','CANCELLED','DECLINED','OPEN','RESOLVED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `application_id` int DEFAULT NULL,
  `author_id` int NOT NULL,
  `job_post_id` int NOT NULL,
  `recipient_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_interaction_application` (`application_id`,`id`),
  KEY `ix_interaction_reporter` (`author_id`,`kind`,`id`),
  KEY `FKpm3kh0v857mwbf8mnsqveye2u` (`job_post_id`),
  KEY `FKipyg03v4ok7gwnwvvsqiujvc9` (`recipient_id`),
  CONSTRAINT `FK16qm2d7pw3eeyi3227c1m7djq` FOREIGN KEY (`author_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `FK65h830xhaudfodcown86a6k14` FOREIGN KEY (`application_id`) REFERENCES `job_applications` (`application_id`),
  CONSTRAINT `FKipyg03v4ok7gwnwvvsqiujvc9` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `FKpm3kh0v857mwbf8mnsqveye2u` FOREIGN KEY (`job_post_id`) REFERENCES `job_posts` (`job_post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `role` (
  `role_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`role_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `store_reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `store_id` int NOT NULL,
  `reviewer_user_id` int NOT NULL,
  `employment_record_id` int NOT NULL,
  `rating` int NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  UNIQUE KEY `employment_record_id` (`employment_record_id`),
  KEY `store_id` (`store_id`),
  KEY `reviewer_user_id` (`reviewer_user_id`),
  CONSTRAINT `store_reviews_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `stores` (`store_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `store_reviews_ibfk_2` FOREIGN KEY (`reviewer_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `store_reviews_ibfk_3` FOREIGN KEY (`employment_record_id`) REFERENCES `employment_records` (`employment_record_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ck_store_reviews_status_current` CHECK ((`status` in (_utf8mb4'VISIBLE',_utf8mb4'HIDDEN',_utf8mb4'REPORTED'))),
  CONSTRAINT `store_reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `stores` (
  `store_id` int NOT NULL AUTO_INCREMENT,
  `employer_id` int NOT NULL,
  `store_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_contact` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `district` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ward` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `street_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_approved` bit(1) DEFAULT NULL,
  `cover_image_url` varchar(1024) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`store_id`),
  KEY `employer_id` (`employer_id`),
  CONSTRAINT `stores_ibfk_1` FOREIGN KEY (`employer_id`) REFERENCES `employers` (`employer_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `application_id` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `message` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `read_at` datetime(6) DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_notification_recipient` (`user_id`,`id`),
  CONSTRAINT `FK9f86wonnl11hos1cuf5fibutl` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_oauth_accounts` (
  `oauth_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `provider` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider_account_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`oauth_id`),
  UNIQUE KEY `provider` (`provider`,`provider_account_id`),
  UNIQUE KEY `UKh45mrxw5ewtshfmg4924a9wke` (`provider`,`provider_account_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_oauth_accounts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_roles` (
  `user_id` int NOT NULL,
  `role_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`user_id`,`role_name`),
  KEY `role_name` (`role_name`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_name`) REFERENCES `role` (`role_name`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_saved_jobs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `job_post_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK65qglntk8hd1l6w7295ys0bd9` (`user_id`,`job_post_id`),
  KEY `FKdww1f9u0lfx3ibhde7lk1giyj` (`job_post_id`),
  CONSTRAINT `FK4874ehrmlu27qyirx0f1a54e1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `FKdww1f9u0lfx3ibhde7lk1giyj` FOREIGN KEY (`job_post_id`) REFERENCES `job_posts` (`job_post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `auth_version` int NOT NULL DEFAULT '0',
  `row_version` bigint NOT NULL DEFAULT '0',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `work_shifts` (
  `shift_id` int NOT NULL AUTO_INCREMENT,
  `shift_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `is_active` bit(1) NOT NULL,
  `is_flexible` bit(1) NOT NULL,
  `sort_order` int NOT NULL,
  PRIMARY KEY (`shift_id`),
  UNIQUE KEY `shift_name` (`shift_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SET FOREIGN_KEY_CHECKS=1;

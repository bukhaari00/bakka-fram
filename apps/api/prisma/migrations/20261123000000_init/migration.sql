-- Bakka Farm Management System - MySQL 8 Baseline Migration
-- Migration: 20261123000000_init

CREATE TABLE `roles` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `description` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `permissions` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `module` VARCHAR(50) NOT NULL,
    UNIQUE INDEX `permissions_code_key`(`code`),
    INDEX `permissions_module_idx`(`module`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `role_permissions` (
    `id` CHAR(36) NOT NULL,
    `role_id` CHAR(36) NOT NULL,
    `permission_id` CHAR(36) NOT NULL,
    UNIQUE INDEX `role_permissions_role_id_permission_id_key`(`role_id`, `permission_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `role_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `role_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `farms` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `location` VARCHAR(255) NULL,
    `contact_phone` VARCHAR(50) NULL,
    `contact_email` VARCHAR(191) NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
    `timezone` VARCHAR(50) NOT NULL DEFAULT 'UTC',
    `default_language` VARCHAR(10) NOT NULL DEFAULT 'en',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `farms_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `farm_settings` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `setting_key` VARCHAR(100) NOT NULL,
    `setting_value` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `farm_settings_farm_id_setting_key_key`(`farm_id`, `setting_key`),
    PRIMARY KEY (`id`),
    CONSTRAINT `farm_settings_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(100) NULL,
    `phone` VARCHAR(50) NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(150) NOT NULL,
    `role_name` VARCHAR(50) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_username_key`(`username`),
    INDEX `users_farm_id_idx`(`farm_id`),
    INDEX `users_role_name_idx`(`role_name`),
    INDEX `users_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`),
    CONSTRAINT `users_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `user_devices` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `device_id` VARCHAR(128) NOT NULL,
    `device_name` VARCHAR(100) NULL,
    `offline_verifier_hash` VARCHAR(255) NULL,
    `offline_verifier_salt` VARCHAR(128) NULL,
    `enrolled_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_sync_at` DATETIME(3) NULL,
    `is_revoked` BOOLEAN NOT NULL DEFAULT false,
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `user_devices_device_id_key`(`device_id`),
    INDEX `user_devices_user_id_idx`(`user_id`),
    INDEX `user_devices_is_revoked_idx`(`is_revoked`),
    PRIMARY KEY (`id`),
    CONSTRAINT `user_devices_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `sessions` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `token_hash` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `sessions_token_hash_key`(`token_hash`),
    INDEX `sessions_user_id_idx`(`user_id`),
    INDEX `sessions_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`),
    CONSTRAINT `sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `fields` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `total_area` DECIMAL(14, 3) NOT NULL,
    `area_unit` VARCHAR(20) NOT NULL DEFAULT 'HA',
    `soil_type` VARCHAR(100) NULL,
    `water_source` VARCHAR(100) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    UNIQUE INDEX `fields_farm_id_code_key`(`farm_id`, `code`),
    INDEX `fields_farm_id_status_idx`(`farm_id`, `status`),
    PRIMARY KEY (`id`),
    CONSTRAINT `fields_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `seasons` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    UNIQUE INDEX `seasons_farm_id_name_key`(`farm_id`, `name`),
    INDEX `seasons_farm_id_status_idx`(`farm_id`, `status`),
    PRIMARY KEY (`id`),
    CONSTRAINT `seasons_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `units` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `symbol` VARCHAR(20) NOT NULL,
    `category` VARCHAR(30) NOT NULL,
    `conversion_factor_to_base` DECIMAL(14, 4) NOT NULL DEFAULT 1.0000,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `units_farm_id_symbol_key`(`farm_id`, `symbol`),
    INDEX `units_farm_id_category_idx`(`farm_id`, `category`),
    PRIMARY KEY (`id`),
    CONSTRAINT `units_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `crop_types` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `category` VARCHAR(50) NULL,
    `default_unit` VARCHAR(20) NOT NULL DEFAULT 'KG',
    `expected_duration_days` INTEGER NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `crop_types_farm_id_name_key`(`farm_id`, `name`),
    PRIMARY KEY (`id`),
    CONSTRAINT `crop_types_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `crop_varieties` (
    `id` CHAR(36) NOT NULL,
    `crop_type_id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `days_to_maturity` INTEGER NULL,
    `yield_potential` VARCHAR(100) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `crop_varieties_crop_type_id_name_key`(`crop_type_id`, `name`),
    PRIMARY KEY (`id`),
    CONSTRAINT `crop_varieties_crop_type_id_fkey` FOREIGN KEY (`crop_type_id`) REFERENCES `crop_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `planting_batches` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `field_id` CHAR(36) NOT NULL,
    `crop_type_id` CHAR(36) NOT NULL,
    `crop_variety_id` CHAR(36) NULL,
    `season_id` CHAR(36) NOT NULL,
    `batch_code` VARCHAR(60) NOT NULL,
    `planting_date` DATE NOT NULL,
    `planted_area` DECIMAL(14, 3) NOT NULL,
    `area_unit` VARCHAR(20) NOT NULL DEFAULT 'HA',
    `seed_quantity` DECIMAL(14, 3) NOT NULL,
    `seed_unit` VARCHAR(20) NOT NULL DEFAULT 'KG',
    `planting_method` VARCHAR(100) NULL,
    `expected_harvest_date` DATE NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'PLANTED',
    `responsible_user_id` CHAR(36) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    UNIQUE INDEX `planting_batches_farm_id_batch_code_key`(`farm_id`, `batch_code`),
    INDEX `planting_batches_farm_id_status_idx`(`farm_id`, `status`),
    INDEX `planting_batches_field_id_idx`(`field_id`),
    INDEX `planting_batches_season_id_idx`(`season_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `planting_batches_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `planting_batches_field_id_fkey` FOREIGN KEY (`field_id`) REFERENCES `fields`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `planting_batches_crop_type_id_fkey` FOREIGN KEY (`crop_type_id`) REFERENCES `crop_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `planting_batches_crop_variety_id_fkey` FOREIGN KEY (`crop_variety_id`) REFERENCES `crop_varieties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `planting_batches_season_id_fkey` FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `crop_observations` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `planting_batch_id` CHAR(36) NOT NULL,
    `field_id` CHAR(36) NULL,
    `reporter_user_id` CHAR(36) NOT NULL,
    `observation_date` DATE NOT NULL,
    `growth_stage` VARCHAR(100) NULL,
    `crop_condition` VARCHAR(50) NOT NULL,
    `pest_disease_signs` VARCHAR(255) NULL,
    `notes` TEXT NULL,
    `photo_url` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    INDEX `crop_observations_farm_id_observation_date_idx`(`farm_id`, `observation_date`),
    INDEX `crop_observations_planting_batch_id_idx`(`planting_batch_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `crop_observations_planting_batch_id_fkey` FOREIGN KEY (`planting_batch_id`) REFERENCES `planting_batches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `crop_observations_field_id_fkey` FOREIGN KEY (`field_id`) REFERENCES `fields`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `crop_observations_reporter_user_id_fkey` FOREIGN KEY (`reporter_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `tasks` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `task_type` VARCHAR(50) NOT NULL,
    `field_id` CHAR(36) NULL,
    `planting_batch_id` CHAR(36) NULL,
    `supervisor_user_id` CHAR(36) NULL,
    `priority` VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    `status` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    `planned_date` DATE NOT NULL,
    `due_date` DATE NULL,
    `completed_at` DATETIME(3) NULL,
    `labor_hours` DECIMAL(6, 2) NULL,
    `instructions` TEXT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    INDEX `tasks_farm_id_status_idx`(`farm_id`, `status`),
    INDEX `tasks_farm_id_planned_date_idx`(`farm_id`, `planned_date`),
    INDEX `tasks_field_id_idx`(`field_id`),
    INDEX `tasks_planting_batch_id_idx`(`planting_batch_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `tasks_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `tasks_field_id_fkey` FOREIGN KEY (`field_id`) REFERENCES `fields`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `tasks_planting_batch_id_fkey` FOREIGN KEY (`planting_batch_id`) REFERENCES `planting_batches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `tasks_supervisor_user_id_fkey` FOREIGN KEY (`supervisor_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `task_assignments` (
    `id` CHAR(36) NOT NULL,
    `task_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `task_assignments_task_id_user_id_key`(`task_id`, `user_id`),
    INDEX `task_assignments_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `task_assignments_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `task_assignments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `task_activity_logs` (
    `id` CHAR(36) NOT NULL,
    `task_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `status_from` VARCHAR(30) NOT NULL,
    `status_to` VARCHAR(30) NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `task_activity_logs_task_id_idx`(`task_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `task_activity_logs_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `task_activity_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `irrigation_events` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `field_id` CHAR(36) NOT NULL,
    `planting_batch_id` CHAR(36) NULL,
    `recorded_by_user_id` CHAR(36) NOT NULL,
    `event_date` DATETIME(3) NOT NULL,
    `water_source` VARCHAR(100) NOT NULL,
    `irrigation_method` VARCHAR(100) NOT NULL,
    `duration_minutes` INTEGER NULL,
    `water_volume_liters` DECIMAL(14, 2) NULL,
    `cost` DECIMAL(14, 2) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    INDEX `irrigation_events_farm_id_event_date_idx`(`farm_id`, `event_date`),
    INDEX `irrigation_events_field_id_idx`(`field_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `irrigation_events_field_id_fkey` FOREIGN KEY (`field_id`) REFERENCES `fields`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `irrigation_events_planting_batch_id_fkey` FOREIGN KEY (`planting_batch_id`) REFERENCES `planting_batches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `irrigation_events_recorded_by_user_id_fkey` FOREIGN KEY (`recorded_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `inventory_items` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `default_unit` VARCHAR(20) NOT NULL DEFAULT 'KG',
    `reorder_level` DECIMAL(14, 3) NOT NULL DEFAULT 0,
    `current_balance` DECIMAL(14, 3) NOT NULL DEFAULT 0,
    `requires_expiry` BOOLEAN NOT NULL DEFAULT false,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    UNIQUE INDEX `inventory_items_farm_id_code_key`(`farm_id`, `code`),
    INDEX `inventory_items_farm_id_category_idx`(`farm_id`, `category`),
    PRIMARY KEY (`id`),
    CONSTRAINT `inventory_items_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `inventory_locations` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `description` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `inventory_locations_farm_id_code_key`(`farm_id`, `code`),
    PRIMARY KEY (`id`),
    CONSTRAINT `inventory_locations_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `stock_receipts` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `supplier_id` CHAR(36) NULL,
    `receipt_number` VARCHAR(60) NOT NULL,
    `receipt_date` DATE NOT NULL,
    `invoice_reference` VARCHAR(100) NULL,
    `total_amount` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `recorded_by_user_id` CHAR(36) NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    UNIQUE INDEX `stock_receipts_farm_id_receipt_number_key`(`farm_id`, `receipt_number`),
    INDEX `stock_receipts_farm_id_receipt_date_idx`(`farm_id`, `receipt_date`),
    PRIMARY KEY (`id`),
    CONSTRAINT `stock_receipts_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `stock_receipts_recorded_by_user_id_fkey` FOREIGN KEY (`recorded_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `stock_receipt_lines` (
    `id` CHAR(36) NOT NULL,
    `receipt_id` CHAR(36) NOT NULL,
    `item_id` CHAR(36) NOT NULL,
    `location_id` CHAR(36) NULL,
    `quantity` DECIMAL(14, 3) NOT NULL,
    `unit` VARCHAR(20) NOT NULL,
    `unit_cost` DECIMAL(14, 2) NOT NULL,
    `total_cost` DECIMAL(14, 2) NOT NULL,
    `batch_number` VARCHAR(100) NULL,
    `expiry_date` DATE NULL,
    INDEX `stock_receipt_lines_receipt_id_idx`(`receipt_id`),
    INDEX `stock_receipt_lines_item_id_idx`(`item_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `stock_receipt_lines_receipt_id_fkey` FOREIGN KEY (`receipt_id`) REFERENCES `stock_receipts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `stock_receipt_lines_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `inventory_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `stock_receipt_lines_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `inventory_locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `stock_issues` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `issue_number` VARCHAR(60) NOT NULL,
    `issue_date` DATE NOT NULL,
    `purpose` VARCHAR(100) NOT NULL,
    `field_id` CHAR(36) NULL,
    `planting_batch_id` CHAR(36) NULL,
    `task_id` CHAR(36) NULL,
    `issued_to_user_id` CHAR(36) NULL,
    `recorded_by_user_id` CHAR(36) NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    UNIQUE INDEX `stock_issues_farm_id_issue_number_key`(`farm_id`, `issue_number`),
    INDEX `stock_issues_farm_id_issue_date_idx`(`farm_id`, `issue_date`),
    PRIMARY KEY (`id`),
    CONSTRAINT `stock_issues_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `stock_issues_field_id_fkey` FOREIGN KEY (`field_id`) REFERENCES `fields`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `stock_issues_planting_batch_id_fkey` FOREIGN KEY (`planting_batch_id`) REFERENCES `planting_batches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `stock_issues_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `stock_issues_recorded_by_user_id_fkey` FOREIGN KEY (`recorded_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `stock_issue_lines` (
    `id` CHAR(36) NOT NULL,
    `issue_id` CHAR(36) NOT NULL,
    `item_id` CHAR(36) NOT NULL,
    `location_id` CHAR(36) NULL,
    `quantity` DECIMAL(14, 3) NOT NULL,
    `unit` VARCHAR(20) NOT NULL,
    `unit_cost` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `total_cost` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    INDEX `stock_issue_lines_issue_id_idx`(`issue_id`),
    INDEX `stock_issue_lines_item_id_idx`(`item_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `stock_issue_lines_issue_id_fkey` FOREIGN KEY (`issue_id`) REFERENCES `stock_issues`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `stock_issue_lines_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `inventory_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `stock_issue_lines_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `inventory_locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `stock_adjustments` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `adjustment_number` VARCHAR(60) NOT NULL,
    `adjustment_date` DATE NOT NULL,
    `item_id` CHAR(36) NOT NULL,
    `location_id` CHAR(36) NULL,
    `old_quantity` DECIMAL(14, 3) NOT NULL,
    `new_quantity` DECIMAL(14, 3) NOT NULL,
    `difference_quantity` DECIMAL(14, 3) NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `approved_by_user_id` CHAR(36) NULL,
    `recorded_by_user_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    UNIQUE INDEX `stock_adjustments_farm_id_adjustment_number_key`(`farm_id`, `adjustment_number`),
    INDEX `stock_adjustments_farm_id_adjustment_date_idx`(`farm_id`, `adjustment_date`),
    PRIMARY KEY (`id`),
    CONSTRAINT `stock_adjustments_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `stock_adjustments_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `inventory_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `stock_adjustments_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `inventory_locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `stock_adjustments_recorded_by_user_id_fkey` FOREIGN KEY (`recorded_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `stock_adjustments_approved_by_user_id_fkey` FOREIGN KEY (`approved_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `stock_ledger` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `item_id` CHAR(36) NOT NULL,
    `location_id` CHAR(36) NULL,
    `movement_type` VARCHAR(30) NOT NULL,
    `quantity` DECIMAL(14, 3) NOT NULL,
    `running_balance` DECIMAL(14, 3) NOT NULL,
    `reference_type` VARCHAR(50) NOT NULL,
    `reference_id` CHAR(36) NOT NULL,
    `recorded_by_user_id` CHAR(36) NULL,
    `notes` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `stock_ledger_farm_id_item_id_created_at_idx`(`farm_id`, `item_id`, `created_at`),
    INDEX `stock_ledger_reference_type_reference_id_idx`(`reference_type`, `reference_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `stock_ledger_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `stock_ledger_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `inventory_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `stock_ledger_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `inventory_locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `harvest_records` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `planting_batch_id` CHAR(36) NOT NULL,
    `field_id` CHAR(36) NOT NULL,
    `harvest_date` DATE NOT NULL,
    `quantity` DECIMAL(14, 3) NOT NULL,
    `unit` VARCHAR(20) NOT NULL DEFAULT 'KG',
    `quality_grade` VARCHAR(30) NULL,
    `harvested_by_users` VARCHAR(255) NULL,
    `labor_cost` DECIMAL(14, 2) NULL DEFAULT 0,
    `recorded_by_user_id` CHAR(36) NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    INDEX `harvest_records_farm_id_harvest_date_idx`(`farm_id`, `harvest_date`),
    INDEX `harvest_records_planting_batch_id_idx`(`planting_batch_id`),
    INDEX `harvest_records_field_id_idx`(`field_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `harvest_records_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `harvest_records_planting_batch_id_fkey` FOREIGN KEY (`planting_batch_id`) REFERENCES `planting_batches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `harvest_records_field_id_fkey` FOREIGN KEY (`field_id`) REFERENCES `fields`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `harvest_records_recorded_by_user_id_fkey` FOREIGN KEY (`recorded_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `produce_lots` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `harvest_record_id` CHAR(36) NOT NULL,
    `lot_number` VARCHAR(60) NOT NULL,
    `initial_quantity` DECIMAL(14, 3) NOT NULL,
    `current_quantity` DECIMAL(14, 3) NOT NULL,
    `unit` VARCHAR(20) NOT NULL DEFAULT 'KG',
    `storage_location_id` CHAR(36) NULL,
    `quality_grade` VARCHAR(30) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    UNIQUE INDEX `produce_lots_farm_id_lot_number_key`(`farm_id`, `lot_number`),
    INDEX `produce_lots_farm_id_status_idx`(`farm_id`, `status`),
    PRIMARY KEY (`id`),
    CONSTRAINT `produce_lots_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `produce_lots_harvest_record_id_fkey` FOREIGN KEY (`harvest_record_id`) REFERENCES `harvest_records`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `produce_lots_storage_location_id_fkey` FOREIGN KEY (`storage_location_id`) REFERENCES `inventory_locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `produce_movements` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `produce_lot_id` CHAR(36) NOT NULL,
    `destination` VARCHAR(50) NOT NULL,
    `quantity` DECIMAL(14, 3) NOT NULL,
    `unit` VARCHAR(20) NOT NULL,
    `movement_date` DATE NOT NULL,
    `recorded_by_user_id` CHAR(36) NULL,
    `reference_type` VARCHAR(50) NULL,
    `reference_id` CHAR(36) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `produce_movements_farm_id_destination_idx`(`farm_id`, `destination`),
    INDEX `produce_movements_produce_lot_id_idx`(`produce_lot_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `produce_movements_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `produce_movements_produce_lot_id_fkey` FOREIGN KEY (`produce_lot_id`) REFERENCES `produce_lots`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `customers` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(50) NULL,
    `email` VARCHAR(191) NULL,
    `address` VARCHAR(255) NULL,
    `opening_balance` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `current_balance` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    INDEX `customers_farm_id_name_idx`(`farm_id`, `name`),
    PRIMARY KEY (`id`),
    CONSTRAINT `customers_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `sales` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `customer_id` CHAR(36) NOT NULL,
    `invoice_number` VARCHAR(60) NOT NULL,
    `temporary_offline_ref` VARCHAR(100) NULL,
    `sale_date` DATE NOT NULL,
    `due_date` DATE NULL,
    `total_amount` DECIMAL(14, 2) NOT NULL,
    `discount_amount` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `paid_amount` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `payment_status` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    `notes` TEXT NULL,
    `recorded_by_user_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    UNIQUE INDEX `sales_farm_id_invoice_number_key`(`farm_id`, `invoice_number`),
    INDEX `sales_farm_id_sale_date_idx`(`farm_id`, `sale_date`),
    INDEX `sales_customer_id_idx`(`customer_id`),
    INDEX `sales_temporary_offline_ref_idx`(`temporary_offline_ref`),
    PRIMARY KEY (`id`),
    CONSTRAINT `sales_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `sales_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `sales_recorded_by_user_id_fkey` FOREIGN KEY (`recorded_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `sale_lines` (
    `id` CHAR(36) NOT NULL,
    `sale_id` CHAR(36) NOT NULL,
    `produce_lot_id` CHAR(36) NULL,
    `crop_type_id` CHAR(36) NULL,
    `description` VARCHAR(255) NOT NULL,
    `quantity` DECIMAL(14, 3) NOT NULL,
    `unit` VARCHAR(20) NOT NULL,
    `unit_price` DECIMAL(14, 2) NOT NULL,
    `line_total` DECIMAL(14, 2) NOT NULL,
    INDEX `sale_lines_sale_id_idx`(`sale_id`),
    INDEX `sale_lines_produce_lot_id_idx`(`produce_lot_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `sale_lines_sale_id_fkey` FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `sale_lines_produce_lot_id_fkey` FOREIGN KEY (`produce_lot_id`) REFERENCES `produce_lots`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `sale_lines_crop_type_id_fkey` FOREIGN KEY (`crop_type_id`) REFERENCES `crop_types`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `customer_payments` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `customer_id` CHAR(36) NOT NULL,
    `sale_id` CHAR(36) NULL,
    `payment_number` VARCHAR(60) NOT NULL,
    `payment_date` DATE NOT NULL,
    `amount` DECIMAL(14, 2) NOT NULL,
    `payment_method` VARCHAR(50) NOT NULL,
    `reference_code` VARCHAR(100) NULL,
    `received_by_user_id` CHAR(36) NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `customer_payments_farm_id_payment_number_key`(`farm_id`, `payment_number`),
    INDEX `customer_payments_farm_id_payment_date_idx`(`farm_id`, `payment_date`),
    INDEX `customer_payments_customer_id_idx`(`customer_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `customer_payments_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `customer_payments_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `customer_payments_sale_id_fkey` FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `customer_payments_received_by_user_id_fkey` FOREIGN KEY (`received_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `suppliers` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `contact_person` VARCHAR(100) NULL,
    `phone` VARCHAR(50) NULL,
    `email` VARCHAR(191) NULL,
    `address` VARCHAR(255) NULL,
    `opening_balance` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `current_balance` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    INDEX `suppliers_farm_id_name_idx`(`farm_id`, `name`),
    PRIMARY KEY (`id`),
    CONSTRAINT `suppliers_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `purchases` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `supplier_id` CHAR(36) NOT NULL,
    `purchase_number` VARCHAR(60) NOT NULL,
    `invoice_reference` VARCHAR(100) NULL,
    `purchase_date` DATE NOT NULL,
    `total_amount` DECIMAL(14, 2) NOT NULL,
    `paid_amount` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `payment_status` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    `notes` TEXT NULL,
    `recorded_by_user_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    UNIQUE INDEX `purchases_farm_id_purchase_number_key`(`farm_id`, `purchase_number`),
    INDEX `purchases_farm_id_purchase_date_idx`(`farm_id`, `purchase_date`),
    INDEX `purchases_supplier_id_idx`(`supplier_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `purchases_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `purchases_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `purchases_recorded_by_user_id_fkey` FOREIGN KEY (`recorded_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `purchase_lines` (
    `id` CHAR(36) NOT NULL,
    `purchase_id` CHAR(36) NOT NULL,
    `item_id` CHAR(36) NULL,
    `description` VARCHAR(255) NOT NULL,
    `quantity` DECIMAL(14, 3) NOT NULL,
    `unit` VARCHAR(20) NOT NULL,
    `unit_price` DECIMAL(14, 2) NOT NULL,
    `line_total` DECIMAL(14, 2) NOT NULL,
    INDEX `purchase_lines_purchase_id_idx`(`purchase_id`),
    INDEX `purchase_lines_item_id_idx`(`item_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `purchase_lines_purchase_id_fkey` FOREIGN KEY (`purchase_id`) REFERENCES `purchases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `purchase_lines_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `inventory_items`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `supplier_payments` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `supplier_id` CHAR(36) NOT NULL,
    `purchase_id` CHAR(36) NULL,
    `payment_number` VARCHAR(60) NOT NULL,
    `payment_date` DATE NOT NULL,
    `amount` DECIMAL(14, 2) NOT NULL,
    `payment_method` VARCHAR(50) NOT NULL,
    `reference_code` VARCHAR(100) NULL,
    `paid_by_user_id` CHAR(36) NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `supplier_payments_farm_id_payment_number_key`(`farm_id`, `payment_number`),
    INDEX `supplier_payments_farm_id_payment_date_idx`(`farm_id`, `payment_date`),
    INDEX `supplier_payments_supplier_id_idx`(`supplier_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `supplier_payments_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `supplier_payments_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `supplier_payments_purchase_id_fkey` FOREIGN KEY (`purchase_id`) REFERENCES `purchases`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `supplier_payments_paid_by_user_id_fkey` FOREIGN KEY (`paid_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `expense_categories` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `expense_categories_farm_id_name_key`(`farm_id`, `name`),
    PRIMARY KEY (`id`),
    CONSTRAINT `expense_categories_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `expenses` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `category_id` CHAR(36) NOT NULL,
    `field_id` CHAR(36) NULL,
    `planting_batch_id` CHAR(36) NULL,
    `season_id` CHAR(36) NULL,
    `expense_date` DATE NOT NULL,
    `amount` DECIMAL(14, 2) NOT NULL,
    `payment_method` VARCHAR(50) NOT NULL,
    `vendor_name` VARCHAR(150) NULL,
    `description` TEXT NULL,
    `receipt_attachment_url` VARCHAR(255) NULL,
    `recorded_by_user_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    INDEX `expenses_farm_id_expense_date_idx`(`farm_id`, `expense_date`),
    INDEX `expenses_category_id_idx`(`category_id`),
    INDEX `expenses_field_id_idx`(`field_id`),
    INDEX `expenses_planting_batch_id_idx`(`planting_batch_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `expenses_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `expenses_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `expense_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `expenses_field_id_fkey` FOREIGN KEY (`field_id`) REFERENCES `fields`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `expenses_planting_batch_id_fkey` FOREIGN KEY (`planting_batch_id`) REFERENCES `planting_batches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `expenses_season_id_fkey` FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `expenses_recorded_by_user_id_fkey` FOREIGN KEY (`recorded_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `cash_accounts` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `account_type` VARCHAR(50) NOT NULL,
    `current_balance` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `cash_accounts_farm_id_name_key`(`farm_id`, `name`),
    PRIMARY KEY (`id`),
    CONSTRAINT `cash_accounts_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `cash_transactions` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `cash_account_id` CHAR(36) NOT NULL,
    `transaction_type` VARCHAR(30) NOT NULL,
    `amount` DECIMAL(14, 2) NOT NULL,
    `running_balance` DECIMAL(14, 2) NOT NULL,
    `reference_type` VARCHAR(50) NULL,
    `reference_id` CHAR(36) NULL,
    `transaction_date` DATE NOT NULL,
    `recorded_by_user_id` CHAR(36) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `cash_transactions_farm_id_cash_account_id_transaction_date_idx`(`farm_id`, `cash_account_id`, `transaction_date`),
    INDEX `cash_transactions_reference_type_reference_id_idx`(`reference_type`, `reference_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `cash_transactions_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `cash_transactions_cash_account_id_fkey` FOREIGN KEY (`cash_account_id`) REFERENCES `cash_accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `sync_operations` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `device_id` VARCHAR(128) NOT NULL,
    `operation_id` VARCHAR(128) NOT NULL,
    `entity_type` VARCHAR(50) NOT NULL,
    `entity_id` CHAR(36) NOT NULL,
    `operation_type` VARCHAR(20) NOT NULL,
    `payload_json` TEXT NOT NULL,
    `base_version` INTEGER NOT NULL DEFAULT 1,
    `status` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    `error_message` TEXT NULL,
    `synced_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `sync_operations_operation_id_key`(`operation_id`),
    INDEX `sync_operations_farm_id_device_id_status_idx`(`farm_id`, `device_id`, `status`),
    INDEX `sync_operations_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `sync_operations_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `sync_conflicts` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `device_id` VARCHAR(128) NOT NULL,
    `operation_id` VARCHAR(128) NOT NULL,
    `entity_type` VARCHAR(50) NOT NULL,
    `entity_id` CHAR(36) NOT NULL,
    `client_data_json` TEXT NOT NULL,
    `server_data_json` TEXT NOT NULL,
    `resolved` BOOLEAN NOT NULL DEFAULT false,
    `resolved_by_user_id` CHAR(36) NULL,
    `resolution_choice` VARCHAR(30) NULL,
    `resolved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `sync_conflicts_farm_id_resolved_idx`(`farm_id`, `resolved`),
    PRIMARY KEY (`id`),
    CONSTRAINT `sync_conflicts_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `audit_logs` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NULL,
    `action` VARCHAR(100) NOT NULL,
    `entity_type` VARCHAR(50) NOT NULL,
    `entity_id` CHAR(36) NULL,
    `old_values_json` TEXT NULL,
    `new_values_json` TEXT NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `audit_logs_farm_id_entity_type_entity_id_idx`(`farm_id`, `entity_type`, `entity_id`),
    INDEX `audit_logs_farm_id_created_at_idx`(`farm_id`, `created_at`),
    PRIMARY KEY (`id`),
    CONSTRAINT `audit_logs_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `attachments` (
    `id` CHAR(36) NOT NULL,
    `farm_id` CHAR(36) NOT NULL,
    `entity_type` VARCHAR(50) NOT NULL,
    `entity_id` CHAR(36) NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_path` VARCHAR(255) NOT NULL,
    `file_size` INTEGER NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `uploaded_by_user_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `attachments_farm_id_entity_type_entity_id_idx`(`farm_id`, `entity_type`, `entity_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `attachments_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Appointments table
CREATE TABLE IF NOT EXISTS pd.`appointments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NULL,
  `patient_uuid` CHAR(36) NULL,
  `doctor_uuid` CHAR(36) NULL,
  `date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `note` VARCHAR(2000) NULL,
  `status` ENUM('scheduled','completed','cancelled','no_show','rescheduled') NOT NULL DEFAULT 'scheduled',
  `priority` ENUM('low','normal','high') NULL DEFAULT 'normal',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `IDX_appointments_uuid` (`uuid`),
  KEY `IDX_appointments_date` (`date`),
  KEY `IDX_appointments_doctor_uuid` (`doctor_uuid`),
  KEY `IDX_appointments_patient_uuid` (`patient_uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



-- Database Schema for Medical Appointment System
-- Run this script on both RDS instances (PE and CL)

-- Create database
CREATE DATABASE IF NOT EXISTS appointments_pe; -- Change to appointments_cl for Chile
USE appointments_pe; -- Change to appointments_cl for Chile

-- Main appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id VARCHAR(50) UNIQUE NOT NULL COMMENT 'UUID from DynamoDB',
  insured_id VARCHAR(5) NOT NULL COMMENT '5-digit insured person ID',
  schedule_id INT NOT NULL COMMENT 'Schedule slot reference',
  center_id INT COMMENT 'Medical center ID (future use)',
  specialty_id INT COMMENT 'Medical specialty ID (future use)',
  medic_id INT COMMENT 'Doctor ID (future use)',
  appointment_date DATETIME COMMENT 'Scheduled date/time (future use)',
  country_iso VARCHAR(2) NOT NULL COMMENT 'Country code: PE or CL',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_insured (insured_id),
  INDEX idx_appointment (appointment_id),
  INDEX idx_schedule (schedule_id),
  INDEX idx_created (created_at DESC),
  
  -- Constraints
  CONSTRAINT chk_country CHECK (country_iso IN ('PE', 'CL'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit table (optional - for tracking changes)
CREATE TABLE IF NOT EXISTS appointments_audit (
  audit_id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL COMMENT 'INSERT, UPDATE, DELETE',
  changed_by VARCHAR(100) COMMENT 'User or system that made the change',
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  old_values JSON COMMENT 'Previous state',
  new_values JSON COMMENT 'New state',
  
  INDEX idx_appointment_audit (appointment_id),
  INDEX idx_changed_at (changed_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data for testing (optional)
-- INSERT INTO appointments (appointment_id, insured_id, schedule_id, country_iso)
-- VALUES 
--   ('550e8400-e29b-41d4-a716-446655440000', '00123', 100, 'PE'),
--   ('660e8400-e29b-41d4-a716-446655440001', '00456', 200, 'CL');

-- Verify table structure
DESCRIBE appointments;

-- Show indexes
SHOW INDEX FROM appointments;

-- Grant permissions (adjust username as needed)
-- GRANT SELECT, INSERT, UPDATE ON appointments_pe.* TO 'app_user'@'%';
-- FLUSH PRIVILEGES;
-- VitalSoft Database Schema for Prescription Tracking System
-- Created for Doctor Portal Prescription Management

CREATE DATABASE IF NOT EXISTS vitalsoft_db;
USE vitalsoft_db;

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    patient_id VARCHAR(10) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    age INT NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(100),
    address TEXT,
    emergency_contact VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
    doctor_id VARCHAR(10) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    specialization VARCHAR(100),
    license_number VARCHAR(20) UNIQUE,
    phone VARCHAR(15),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medicines table
CREATE TABLE IF NOT EXISTS medicines (
    medicine_id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    manufacturer VARCHAR(100),
    medicine_type ENUM('Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Other') NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(10) NOT NULL,
    doctor_id VARCHAR(10) NOT NULL,
    prescription_date DATE NOT NULL,
    diagnosis TEXT,
    notes TEXT,
    status ENUM('Active', 'Completed', 'Cancelled') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE
);

-- Prescription medicines table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS prescription_medicines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prescription_id INT NOT NULL,
    medicine_id INT NOT NULL,
    quantity INT NOT NULL,
    instructions TEXT NOT NULL,
    dosage_frequency VARCHAR(100) NOT NULL,
    duration_days INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(prescription_id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO patients (patient_id, first_name, last_name, age, gender, phone, email, address) VALUES
('PT001', 'Michael', 'Thompson', 45, 'Male', '555-0101', 'michael.thompson@email.com', '123 Main St, City'),
('PT002', 'Jennifer', 'Lopez', 32, 'Female', '555-0102', 'jennifer.lopez@email.com', '456 Oak Ave, City'),
('PT003', 'Robert', 'Chen', 58, 'Male', '555-0103', 'robert.chen@email.com', '789 Pine Rd, City'),
('PT004', 'Sarah', 'Williams', 28, 'Female', '555-0104', 'sarah.williams@email.com', '321 Elm St, City'),
('PT005', 'David', 'Brown', 67, 'Male', '555-0105', 'david.brown@email.com', '654 Maple Dr, City');

INSERT INTO doctors (doctor_id, first_name, last_name, specialization, license_number, phone, email) VALUES
('DR001', 'Sarah', 'Johnson', 'Internal Medicine', 'MD123456', '555-0201', 'sarah.johnson@vitalsoft.com'),
('DR002', 'John', 'Smith', 'Cardiology', 'MD123457', '555-0202', 'john.smith@vitalsoft.com'),
('DR003', 'Emily', 'Davis', 'Pediatrics', 'MD123458', '555-0203', 'emily.davis@vitalsoft.com');

INSERT INTO medicines (medicine_name, dosage, manufacturer, medicine_type, description) VALUES
('Amoxicillin', '500mg', 'Generic Pharma', 'Tablet', 'Antibiotic for bacterial infections'),
('Ibuprofen', '400mg', 'Pain Relief Inc', 'Tablet', 'Anti-inflammatory pain reliever'),
('Lisinopril', '10mg', 'Heart Care Ltd', 'Tablet', 'ACE inhibitor for blood pressure'),
('Metformin', '850mg', 'Diabetes Solutions', 'Tablet', 'Type 2 diabetes medication'),
('Atorvastatin', '20mg', 'Cholesterol Control', 'Tablet', 'Statin for cholesterol management'),
('Paracetamol', '500mg', 'Generic Pharma', 'Tablet', 'Pain reliever and fever reducer'),
('Omeprazole', '20mg', 'Digestive Health', 'Capsule', 'Proton pump inhibitor for acid reflux'),
('Cetirizine', '10mg', 'Allergy Relief', 'Tablet', 'Antihistamine for allergies');

-- Insert sample prescriptions
INSERT INTO prescriptions (patient_id, doctor_id, prescription_date, diagnosis, notes, status) VALUES
('PT001', 'DR001', '2023-10-15', 'Upper respiratory infection', 'Patient shows signs of bacterial infection', 'Active'),
('PT002', 'DR001', '2023-10-10', 'Hypertension management', 'Regular checkup for blood pressure control', 'Active'),
('PT003', 'DR002', '2023-10-05', 'Diabetes type 2', 'Routine diabetes management', 'Active');

-- Insert sample prescription medicines
INSERT INTO prescription_medicines (prescription_id, medicine_id, quantity, instructions, dosage_frequency, duration_days) VALUES
(1, 1, 30, 'Take with food', 'Three times daily', 10),
(1, 6, 20, 'Take as needed for pain', 'Every 6 hours', 5),
(2, 3, 90, 'Take in the morning', 'Once daily', 30),
(2, 4, 60, 'Take with meals', 'Twice daily', 30),
(3, 4, 90, 'Take with breakfast and dinner', 'Twice daily', 30),
(3, 5, 30, 'Take at bedtime', 'Once daily', 30);

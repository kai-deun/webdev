-- Pharmacy Management System Database Schema

-- =============================================
-- USERS AND AUTHENTICATION
-- =============================================

CREATE TABLE roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    status ENUM('active', 'inactive', 'deactivated') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- =============================================
-- PHARMACY BRANCHES
-- =============================================

CREATE TABLE pharmacy_branches (
    branch_id INT PRIMARY KEY AUTO_INCREMENT,
    branch_name VARCHAR(200) NOT NULL,
    branch_code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    phone_number VARCHAR(20),
    email VARCHAR(191),
    manager_id INT,
    status ENUM('active', 'inactive', 'under_maintenance') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users(user_id)
);

-- =============================================
-- BRANCH STAFF ASSIGNMENT
-- =============================================

CREATE TABLE branch_staff (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    branch_id INT NOT NULL,
    assigned_date DATE NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES pharmacy_branches(branch_id) ON DELETE CASCADE,
    UNIQUE KEY unique_staff_branch (user_id, branch_id)
);

-- =============================================
-- PATIENTS
-- =============================================

CREATE TABLE patients (
    patient_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    insurance_number VARCHAR(100),
    insurance_provider VARCHAR(200),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    blood_type VARCHAR(10),
    allergies TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================
-- MEDICAL HISTORY
-- =============================================

CREATE TABLE medical_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    diagnosis TEXT NOT NULL,
    notes TEXT,
    visit_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(user_id)
);

-- =============================================
-- MEDICINES
-- =============================================

CREATE TABLE medicines (
    medicine_id INT PRIMARY KEY AUTO_INCREMENT,
    medicine_name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    manufacturer VARCHAR(200),
    description TEXT,
    dosage_form VARCHAR(100),
    strength VARCHAR(100),
    unit_price DECIMAL(10, 2) NOT NULL,
    requires_prescription BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- BRANCH INVENTORY
-- =============================================

CREATE TABLE branch_inventory (
    inventory_id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT NOT NULL,
    medicine_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    reorder_level INT DEFAULT 10,
    expiry_date DATE NOT NULL,
    batch_number VARCHAR(100),
    status ENUM('available', 'low_stock', 'expired', 'out_of_stock') DEFAULT 'available',
    last_updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES pharmacy_branches(branch_id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE,
    FOREIGN KEY (last_updated_by) REFERENCES users(user_id)
);

-- =============================================
-- INVENTORY UPDATE APPROVALS
-- =============================================

CREATE TABLE inventory_update_requests (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    inventory_id INT NOT NULL,
    requested_by INT NOT NULL,
    request_type ENUM('add', 'update', 'delete') NOT NULL,
    old_quantity INT,
    new_quantity INT,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by INT,
    approval_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES branch_inventory(inventory_id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES users(user_id),
    FOREIGN KEY (approved_by) REFERENCES users(user_id)
);

-- =============================================
-- PRESCRIPTIONS
-- =============================================

CREATE TABLE prescriptions (
    prescription_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    prescription_date DATE NOT NULL,
    expiry_date DATE,
    diagnosis TEXT,
    notes TEXT,
    status ENUM('active', 'dispensed', 'expired', 'cancelled') DEFAULT 'active',
    renewal_requested BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(user_id)
);

-- =============================================
-- PRESCRIPTION ITEMS
-- =============================================

CREATE TABLE prescription_items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    prescription_id INT NOT NULL,
    medicine_id INT NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    frequency VARCHAR(200),
    duration VARCHAR(100),
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(prescription_id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id)
);

-- =============================================
-- PRESCRIPTION RENEWALS
-- =============================================

CREATE TABLE prescription_renewals (
    renewal_id INT PRIMARY KEY AUTO_INCREMENT,
    prescription_id INT NOT NULL,
    requested_by INT NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    reviewed_by INT,
    review_date TIMESTAMP NULL,
    notes TEXT,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(prescription_id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES users(user_id),
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
);

-- =============================================
-- ORDERS/DISPENSING
-- =============================================

CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    prescription_id INT NOT NULL,
    patient_id INT NOT NULL,
    branch_id INT NOT NULL,
    pharmacist_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
    dispensed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(prescription_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (branch_id) REFERENCES pharmacy_branches(branch_id),
    FOREIGN KEY (pharmacist_id) REFERENCES users(user_id)
);

-- =============================================
-- ORDER ITEMS
-- =============================================

CREATE TABLE order_items (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    medicine_id INT NOT NULL,
    inventory_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id),
    FOREIGN KEY (inventory_id) REFERENCES branch_inventory(inventory_id)
);

-- =============================================
-- PAYMENTS
-- =============================================

CREATE TABLE payment_methods (
    payment_method_id INT PRIMARY KEY AUTO_INCREMENT,
    method_name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    payment_method_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_reference VARCHAR(200),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(payment_method_id)
);

-- =============================================
-- SUPPORT TICKETS
-- =============================================

CREATE TABLE support_tickets (
    ticket_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    assigned_to INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (assigned_to) REFERENCES users(user_id)
);

-- =============================================
-- AUDIT LOG
-- =============================================

CREATE TABLE audit_log (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id INT,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- =============================================
-- INITIAL DATA SEEDING
-- =============================================

-- Insert default roles
INSERT INTO roles (role_name, description) VALUES
('Admin', 'System administrator with full access'),
('Doctor', 'Medical doctor who can prescribe medications'),
('Pharmacist', 'Pharmacy employee who dispenses medications'),
('Pharmacy Manager', 'Manager of pharmacy branches'),
('Patient', 'Patient who receives prescriptions');

-- Insert default payment methods
INSERT INTO payment_methods (method_name) VALUES
('Cash'),
('Credit Card'),
('Debit Card'),
('Insurance'),
('E-Wallet'),
('Bank Transfer');

-- Insert sample users (password: 'password123' hashed with bcrypt)
INSERT INTO users (username, email, password_hash, role_id, first_name, last_name, phone_number, date_of_birth, address, status) VALUES
-- Admin (username: admin, password: admin123)
('admin', 'admin@pharmacy.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 'John', 'Anderson', '+1234567890', '1980-05-15', '123 Admin St, City, State', 'active'),
-- Doctors (username: doctor, password: doctor123)
('doctor', 'dr.smith@hospital.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 'Sarah', 'Smith', '+1234567891', '1975-08-22', '456 Medical Ave, City, State', 'active'),
('dr.johnson', 'dr.johnson@hospital.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 'Michael', 'Johnson', '+1234567892', '1982-03-10', '789 Health Blvd, City, State', 'active'),
-- Pharmacy Managers (username: manager, password: manager123)
('manager', 'manager1@pharmacy.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 'Emily', 'Davis', '+1234567893', '1985-11-30', '321 Manager Rd, City, State', 'active'),
('manager2', 'manager2@pharmacy.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 'Robert', 'Wilson', '+1234567894', '1978-06-18', '654 Branch St, City, State', 'active'),
-- Pharmacists (username: pharmacist, password: pharma123)
('pharmacist', 'pharmacist1@pharmacy.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, 'Jessica', 'Martinez', '+1234567895', '1990-02-14', '987 Pharmacy Ln, City, State', 'active'),
('pharmacist2', 'pharmacist2@pharmacy.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, 'David', 'Garcia', '+1234567896', '1988-09-25', '147 Medicine Way, City, State', 'active'),
('pharmacist3', 'pharmacist3@pharmacy.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, 'Lisa', 'Rodriguez', '+1234567897', '1992-12-08', '258 Health Dr, City, State', 'active'),
('pharmacist4', 'pharmacist4@pharmacy.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, 'James', 'Lee', '+1234567898', '1987-04-20', '369 Care St, City, State', 'active'),
-- Patients (username: patient, password: patient123)
('patient', 'patient1@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 5, 'Maria', 'Thompson', '+1234567899', '1995-07-12', '741 Patient Ave, City, State', 'active'),
('patient2', 'patient2@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 5, 'Christopher', 'White', '+1234567800', '1989-01-28', '852 Wellness Rd, City, State', 'active'),
('patient3', 'patient3@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 5, 'Amanda', 'Harris', '+1234567801', '1993-10-05', '963 Recovery Ln, City, State', 'active'),
('patient4', 'patient4@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 5, 'Daniel', 'Clark', '+1234567802', '1998-03-17', '159 Health Plaza, City, State', 'active'),
('patient5', 'patient5@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 5, 'Jennifer', 'Lewis', '+1234567803', '1986-11-22', '357 Care Center, City, State', 'active');

-- Insert pharmacy branches
INSERT INTO pharmacy_branches (branch_name, branch_code, address, city, state, postal_code, phone_number, email, manager_id, status) VALUES
('Central Pharmacy', 'PH-CENTRAL-001', '100 Main Street', 'Metro City', 'Metro Manila', '1000', '+6321234567', 'central@pharmacy.com', 4, 'active'),
('North Branch Pharmacy', 'PH-NORTH-002', '200 Northern Ave', 'Quezon City', 'Metro Manila', '1100', '+6321234568', 'north@pharmacy.com', 4, 'active'),
('East Side Pharmacy', 'PH-EAST-003', '300 Eastern Road', 'Pasig City', 'Metro Manila', '1600', '+6321234569', 'east@pharmacy.com', 5, 'active'),
('South Mall Pharmacy', 'PH-SOUTH-004', '400 Southern Blvd', 'Makati City', 'Metro Manila', '1200', '+6321234570', 'south@pharmacy.com', 5, 'inactive');

-- Assign staff to branches
INSERT INTO branch_staff (user_id, branch_id, assigned_date, status) VALUES
(6, 1, '2024-01-15', 'active'),  -- pharmacist1 at Central
(7, 1, '2024-01-15', 'active'),  -- pharmacist2 at Central
(8, 2, '2024-02-01', 'active'),  -- pharmacist3 at North
(9, 3, '2024-02-15', 'active');  -- pharmacist4 at East

-- Insert patient details
INSERT INTO patients (user_id, insurance_number, insurance_provider, emergency_contact_name, emergency_contact_phone, blood_type, allergies) VALUES
(10, 'INS-001-2024', 'HealthCare Plus', 'John Thompson', '+1234567900', 'O+', 'Penicillin'),
(11, 'INS-002-2024', 'MediCare Shield', 'Sarah White', '+1234567901', 'A+', 'None'),
(12, 'INS-003-2024', 'WellCare Insurance', 'Robert Harris', '+1234567902', 'B+', 'Sulfa drugs'),
(13, 'INS-004-2024', 'HealthCare Plus', 'Linda Clark', '+1234567903', 'AB+', 'Aspirin'),
(14, 'INS-005-2024', 'Prime Health', 'Michael Lewis', '+1234567904', 'O-', 'Codeine');

-- Insert medicines
INSERT INTO medicines (medicine_name, generic_name, manufacturer, description, dosage_form, strength, unit_price, requires_prescription) VALUES
('Amoxicillin', 'Amoxicillin', 'PharmaCorp', 'Antibiotic for bacterial infections', 'Capsule', '500mg', 15.50, TRUE),
('Paracetamol', 'Acetaminophen', 'GenericMed', 'Pain reliever and fever reducer', 'Tablet', '500mg', 5.00, FALSE),
('Ibuprofen', 'Ibuprofen', 'PainRelief Inc', 'Anti-inflammatory pain reliever', 'Tablet', '400mg', 8.00, FALSE),
('Metformin', 'Metformin HCl', 'DiabetesCare', 'Diabetes medication', 'Tablet', '500mg', 12.00, TRUE),
('Omeprazole', 'Omeprazole', 'GastroMed', 'Proton pump inhibitor for acid reflux', 'Capsule', '20mg', 18.00, TRUE),
('Losartan', 'Losartan Potassium', 'CardioPharm', 'Blood pressure medication', 'Tablet', '50mg', 20.00, TRUE),
('Atorvastatin', 'Atorvastatin', 'CholesterolCare', 'Cholesterol-lowering medication', 'Tablet', '20mg', 25.00, TRUE),
('Cetirizine', 'Cetirizine HCl', 'AllergyFree', 'Antihistamine for allergies', 'Tablet', '10mg', 6.50, FALSE),
('Salbutamol', 'Salbutamol', 'RespiraCare', 'Bronchodilator for asthma', 'Inhaler', '100mcg', 35.00, TRUE),
('Vitamin C', 'Ascorbic Acid', 'VitaHealth', 'Vitamin supplement', 'Tablet', '500mg', 10.00, FALSE);

-- Insert branch inventory
INSERT INTO branch_inventory (branch_id, medicine_id, quantity, reorder_level, expiry_date, batch_number, status, last_updated_by) VALUES
-- Central Pharmacy (Branch 1)
(1, 1, 150, 20, '2025-12-31', 'BATCH-A001', 'available', 6),
(1, 2, 500, 50, '2026-06-30', 'BATCH-A002', 'available', 6),
(1, 3, 300, 30, '2025-11-30', 'BATCH-A003', 'available', 6),
(1, 4, 200, 25, '2025-10-31', 'BATCH-A004', 'available', 6),
(1, 5, 100, 15, '2026-03-31', 'BATCH-A005', 'available', 6),
(1, 6, 120, 20, '2025-09-30', 'BATCH-A006', 'available', 6),
(1, 7, 80, 15, '2026-01-31', 'BATCH-A007', 'available', 6),
(1, 8, 250, 40, '2026-05-31', 'BATCH-A008', 'available', 6),
(1, 9, 50, 10, '2025-08-31', 'BATCH-A009', 'available', 6),
(1, 10, 400, 60, '2026-12-31', 'BATCH-A010', 'available', 6),
-- North Branch (Branch 2)
(2, 1, 100, 20, '2025-11-30', 'BATCH-B001', 'available', 8),
(2, 2, 350, 50, '2026-04-30', 'BATCH-B002', 'available', 8),
(2, 3, 200, 30, '2025-12-31', 'BATCH-B003', 'available', 8),
(2, 4, 150, 25, '2025-09-30', 'BATCH-B004', 'available', 8),
(2, 5, 75, 15, '2026-02-28', 'BATCH-B005', 'available', 8),
-- East Branch (Branch 3)
(3, 2, 400, 50, '2026-07-31', 'BATCH-C001', 'available', 9),
(3, 3, 180, 30, '2025-10-31', 'BATCH-C002', 'available', 9),
(3, 8, 200, 40, '2026-03-31', 'BATCH-C003', 'available', 9),
(3, 10, 300, 60, '2026-11-30', 'BATCH-C004', 'available', 9);

-- Insert medical history
INSERT INTO medical_history (patient_id, doctor_id, diagnosis, notes, visit_date) VALUES
(1, 2, 'Upper Respiratory Tract Infection', 'Patient presents with cough and fever. Prescribed antibiotics.', '2024-10-15'),
(1, 2, 'Follow-up Visit', 'Patient showing improvement. Continue medication.', '2024-10-22'),
(2, 3, 'Hypertension', 'Blood pressure reading 150/95. Started on antihypertensive medication.', '2024-09-20'),
(3, 2, 'Allergic Rhinitis', 'Seasonal allergies. Prescribed antihistamine.', '2024-10-28'),
(4, 3, 'Type 2 Diabetes Mellitus', 'HbA1c 8.5%. Started on metformin therapy.', '2024-08-10'),
(5, 2, 'Gastroesophageal Reflux Disease', 'Patient complains of heartburn. Prescribed PPI.', '2024-10-30');

-- Insert prescriptions
INSERT INTO prescriptions (patient_id, doctor_id, prescription_date, expiry_date, diagnosis, notes, status) VALUES
(1, 2, '2024-10-15', '2024-11-15', 'Upper Respiratory Tract Infection', 'Take with food', 'dispensed'),
(2, 3, '2024-09-20', '2025-03-20', 'Hypertension', 'Take once daily in the morning', 'active'),
(3, 2, '2024-10-28', '2025-01-28', 'Allergic Rhinitis', 'Take as needed for symptoms', 'active'),
(4, 3, '2024-08-10', '2025-02-10', 'Type 2 Diabetes', 'Take with meals, monitor blood sugar', 'active'),
(5, 2, '2024-10-30', '2025-01-30', 'GERD', 'Take 30 minutes before breakfast', 'active');

-- Insert prescription items
INSERT INTO prescription_items (prescription_id, medicine_id, dosage, quantity, frequency, duration, instructions) VALUES
-- Prescription 1
(1, 1, '500mg', 21, 'Three times daily', '7 days', 'Take one capsule after meals'),
(1, 2, '500mg', 14, 'Twice daily as needed', '7 days', 'For fever or pain'),
-- Prescription 2
(2, 6, '50mg', 90, 'Once daily', '90 days', 'Take in the morning'),
-- Prescription 3
(3, 8, '10mg', 30, 'Once daily', '30 days', 'Take at bedtime'),
-- Prescription 4
(4, 4, '500mg', 180, 'Twice daily', '90 days', 'Take with breakfast and dinner'),
-- Prescription 5
(5, 5, '20mg', 30, 'Once daily', '30 days', 'Take 30 minutes before breakfast');

-- Insert orders
INSERT INTO orders (prescription_id, patient_id, branch_id, pharmacist_id, order_date, total_amount, status, payment_status, dispensed_at) VALUES
(1, 1, 1, 6, '2024-10-15 14:30:00', 395.50, 'completed', 'paid', '2024-10-15 14:45:00'),
(2, 2, 1, 6, '2024-09-20 10:15:00', 1800.00, 'completed', 'paid', '2024-09-20 10:30:00'),
(3, 3, 2, 8, '2024-10-28 16:20:00', 195.00, 'completed', 'paid', '2024-10-28 16:35:00'),
(4, 4, 3, 9, '2024-08-10 11:00:00', 2160.00, 'completed', 'paid', '2024-08-10 11:20:00');

-- Insert order items
INSERT INTO order_items (order_id, medicine_id, inventory_id, quantity, unit_price, subtotal) VALUES
-- Order 1
(1, 1, 1, 21, 15.50, 325.50),
(1, 2, 2, 14, 5.00, 70.00),
-- Order 2
(2, 6, 6, 90, 20.00, 1800.00),
-- Order 3
(3, 8, 13, 30, 6.50, 195.00),
-- Order 4
(4, 4, 4, 180, 12.00, 2160.00);

-- Insert payments
INSERT INTO payments (order_id, payment_method_id, amount, transaction_reference, payment_date, status) VALUES
(1, 1, 395.50, 'CASH-20241015-001', '2024-10-15 14:45:00', 'completed'),
(2, 4, 1800.00, 'INS-20240920-002', '2024-09-20 10:30:00', 'completed'),
(3, 2, 195.00, 'CC-20241028-003', '2024-10-28 16:35:00', 'completed'),
(4, 4, 2160.00, 'INS-20240810-004', '2024-08-10 11:20:00', 'completed');

-- Insert prescription renewal requests
INSERT INTO prescription_renewals (prescription_id, requested_by, request_date, status, reviewed_by, review_date, notes) VALUES
(2, 11, '2024-11-01 09:00:00', 'approved', 3, '2024-11-01 14:30:00', 'Patient showing good response to medication. Approved for renewal.'),
(4, 13, '2024-11-02 10:30:00', 'pending', NULL, NULL, 'Patient requesting early renewal due to travel plans.');

-- Insert support tickets
INSERT INTO support_tickets (user_id, subject, description, priority, status, assigned_to) VALUES
(10, 'Cannot access prescription history', 'I am unable to view my past prescriptions on the portal', 'high', 'in_progress', 1),
(11, 'Update insurance information', 'Need to update my insurance provider details', 'medium', 'open', 1),
(12, 'Question about medication', 'Need clarification on dosage instructions', 'medium', 'resolved', 1),
(14, 'Account login issues', 'Forgot password and cannot reset', 'high', 'resolved', 1);

-- Insert inventory update requests
INSERT INTO inventory_update_requests (inventory_id, requested_by, request_type, old_quantity, new_quantity, reason, status, approved_by, approval_date) VALUES
(1, 6, 'update', 150, 130, 'Stock dispensed for multiple prescriptions', 'approved', 4, '2024-10-15 15:00:00'),
(2, 6, 'update', 500, 486, 'Daily dispensing adjustments', 'approved', 4, '2024-10-15 15:00:00'),
(13, 8, 'update', 250, 220, 'Dispensed for patient orders', 'pending', NULL, NULL);

-- Insert audit log entries
INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values, ip_address) VALUES
(1, 'CREATE', 'users', 10, NULL, '{"username":"patient1","role":"Patient"}', '192.168.1.100'),
(2, 'CREATE', 'prescriptions', 1, NULL, '{"patient_id":1,"status":"active"}', '192.168.1.101'),
(6, 'UPDATE', 'orders', 1, '{"status":"pending"}', '{"status":"completed"}', '192.168.1.102'),
(4, 'UPDATE', 'branch_inventory', 1, '{"quantity":150}', '{"quantity":130}', '192.168.1.103'),
(1, 'UPDATE', 'users', 14, '{"status":"active"}', '{"status":"inactive"}', '192.168.1.100');

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_branch_status ON pharmacy_branches(status);
CREATE INDEX idx_inventory_branch ON branch_inventory(branch_id);
CREATE INDEX idx_inventory_medicine ON branch_inventory(medicine_id);
CREATE INDEX idx_inventory_expiry ON branch_inventory(expiry_date);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_orders_patient ON orders(patient_id);
CREATE INDEX idx_orders_branch ON orders(branch_id);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_medical_history_patient ON medical_history(patient_id);
CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
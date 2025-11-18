# VitalSoft - Complete Installation & Setup Guide

## 📋 Overview

This is a **Pharmacy Management System** built with:
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** PHP with MySQL
- **Database:** MySQL with comprehensive schema
- **Web Server:** Apache (via WAMP64)

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- ✅ WAMP64 installed on Windows
- ✅ MySQL running (part of WAMP64)
- ✅ Apache running (part of WAMP64)
- ✅ Project files in `C:\wamp64\www\webdev`

### Step 1: Start WAMP64

1. Open **WAMP Manager**
2. Click the system tray icon
3. Click **"Start All Services"**
4. Wait for the icon to turn **GREEN** (all services running)

### Step 2: Initialize Database

1. Open your browser
2. Go to: `http://localhost/webdev/setup/setup_database.php`
3. Click **"Start Setup"**
4. Wait for completion (you'll see ✓ marks)
5. Click **"Open Login Page"**

### Step 3: Login & Test

Use these demo credentials:

| Role | Username | Password | Access |
|------|----------|----------|--------|
| Admin | admin | admin123 | Full system access |
| Doctor | doctor | doctor123 | Patient & prescription management |
| Pharmacist | pharmacist | pharma123 | Dispensing & inventory |
| Manager | manager | manager123 | Branch management |
| Patient | patient | patient123 | View prescriptions |

---

## 🔧 Detailed Setup Instructions

### Installation Steps

#### 1. Verify WAMP64 Installation
```
C:\wamp64\        ← Main directory
├── www/
│   └── webdev/   ← Your project
├── bin/
│   ├── apache/
│   ├── mysql/
│   └── php/
└── ...
```

#### 2. Access phpMyAdmin (Optional)
- URL: `http://localhost/phpmyadmin`
- Default User: `root`
- Password: (empty)

#### 3. Run Setup Script
```
http://localhost/webdev/setup/setup_database.php
```

The setup script will:
- ✓ Create `vitalsoft_db` database
- ✓ Create all required tables
- ✓ Insert sample/seed data
- ✓ Set up indexes for performance

#### 4. Verify Installation
```
http://localhost/webdev/setup/setup_database.php?action=verify
```

This will check:
- ✓ Database connection
- ✓ Table creation
- ✓ Sample data

---

## 📁 Project Structure

```
webdev/
├── html/                    # Frontend pages
│   ├── login.html          # Login page
│   ├── Admin.html          # Admin dashboard
│   ├── Doctor.html         # Doctor dashboard
│   ├── patient.html        # Patient dashboard
│   ├── Pharmacy Manager.html
│   └── Pharmacy Employees.html
│
├── css/                     # Stylesheets
│   ├── login.css
│   ├── admin.css
│   ├── patient.css
│   ├── doctor.css
│   ├── pharmacy-manager.css
│   └── pharmacy-employee.css
│
├── js/                      # JavaScript files
│   ├── login.js            # Login logic
│   ├── common.js           # Shared utilities
│   ├── Displays.js         # Display functions
│   ├── EventBinder.js      # Event handling
│   ├── admin.js            # Admin functions
│   ├── patient.js          # Patient functions
│   ├── Medicine.js         # Medicine management
│   ├── Prescriptions.js    # Prescription handling
│   └── ... (other modules)
│
├── php/                     # Backend endpoints
│   ├── config.php          # Database configuration
│   ├── auth.php            # Authentication & login
│   ├── prescription.php    # Prescription CRUD
│   └── (other endpoints)
│
├── database/               # Database files
│   ├── maindb.sql         # Main database schema
│   └── prescription_db.sql # Additional prescriptions
│
├── setup/                  # Setup utilities
│   └── setup_database.php # Database initialization
│
└── README.md              # Documentation
```

---

## 🔐 Database Configuration

File: `php/config.php`

```php
define('DB_HOST', 'localhost');     // MySQL server
define('DB_NAME', 'vitalsoft_db');  // Database name
define('DB_USER', 'root');          // MySQL user
define('DB_PASS', '');              // MySQL password (empty by default)
```

All PHP files use this configuration for database connectivity.

---

## 🔗 API Endpoints

### Authentication
```
POST /php/auth.php?action=login
  - username: string
  - password: string
  
GET /php/auth.php?action=logout
GET /php/auth.php?action=getCurrentUser
```

### Prescriptions
```
GET /php/prescription.php?action=getPatients
GET /php/prescription.php?action=getMedicines
GET /php/prescription.php?action=getPrescriptions
GET /php/prescription.php?action=getPrescriptionDetails&id=1
POST /php/prescription.php?action=savePrescription
POST /php/prescription.php?action=deletePrescription
```

---

## 🛠️ Troubleshooting

### Problem: "Database connection failed"

**Solution 1:** Check WAMP Services
```
1. Open WAMP Manager
2. Ensure all services show GREEN status
3. If not, click "Start All Services"
```

**Solution 2:** Verify MySQL is Running
```
1. WAMP Manager → MySQL → Service
2. Should show "Running on port 3306"
3. If not, click the service name to start
```

**Solution 3:** Reset MySQL Root Password
```
1. WAMP Manager → MySQL → MySQL Console
2. Verify no password is set (press Enter)
3. Update config.php if needed
```

### Problem: "Setup script not found"

**Solution:**
```
1. Verify file exists: C:\wamp64\www\webdev\setup\setup_database.php
2. If not found, create it using the provided code
3. Restart Apache: WAMP Manager → Apache → Restart Service
```

### Problem: "Table doesn't exist"

**Solution:**
```
1. Re-run setup: http://localhost/webdev/setup/setup_database.php?action=setup
2. Check for errors in the output
3. Use phpMyAdmin to verify tables were created
```

### Problem: "Login not working"

**Solution 1:** Verify Demo User Exists
```
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Select 'vitalsoft_db'
3. View 'users' table
4. Check username 'admin' exists
```

**Solution 2:** Check PHP Session Support
```
1. Create test.php in webdev folder
2. Add: <?php phpinfo(); ?>
3. Look for "Registered PHP Streams" section
4. Verify "user_wrapper" is listed
```

**Solution 3:** Clear Browser Cache
```
1. Ctrl + Shift + Delete
2. Clear all cookies
3. Clear all cached images/files
4. Restart browser
```

### Problem: "CORS Error"

**Solution:**
- This is expected for cross-domain requests
- All PHP files have CORS headers enabled
- JavaScript should work fine from localhost

### Problem: "Port Already in Use (Apache)"

**Solution:**
```
1. WAMP Manager → Apache → Apache settings
2. Change port from 80 to 8080
3. Access via: http://localhost:8080/webdev
```

---

## 📊 Database Schema

### Key Tables

#### Users
- Stores all system users (Admin, Doctor, Pharmacist, Patient)
- Linked to roles table
- Password stored with bcrypt hashing

#### Roles
- Admin
- Doctor
- Pharmacist
- Pharmacy Manager
- Patient

#### Patients
- Extended user profile
- Insurance information
- Medical history link

#### Prescriptions
- Prescription records
- Status tracking (active, dispensed, expired, cancelled)
- Doctor and patient references

#### Medicines
- Medicine catalog
- Dosage information
- Price tracking
- Prescription requirement flag

#### Orders
- Dispensing records
- Inventory deduction
- Payment tracking

#### Branch Inventory
- Medicine stock levels per branch
- Expiry date tracking
- Batch number management

---

## 🔑 Default Demo Credentials

All demo accounts use **bcrypt hashed passwords**.

```
ADMIN ACCOUNT
├── Username: admin
├── Password: admin123
├── Email: admin@pharmacy.com
└── Access: Full system access

DOCTOR ACCOUNT
├── Username: doctor
├── Password: doctor123
├── Email: dr.smith@hospital.com
└── Access: Prescription management

PHARMACIST ACCOUNT
├── Username: pharmacist
├── Password: pharma123
├── Email: pharmacist1@pharmacy.com
└── Access: Dispensing & inventory

PHARMACY MANAGER
├── Username: manager
├── Password: manager123
├── Email: manager1@pharmacy.com
└── Access: Branch management

PATIENT ACCOUNT
├── Username: patient
├── Password: patient123
├── Email: patient1@email.com
└── Access: View personal prescriptions
```

---

## 🧪 Testing the System

### Test 1: Login Functionality
```
1. Go to http://localhost/webdev/html/login.html
2. Enter: admin / admin123
3. Should redirect to Admin dashboard
4. Check browser console (F12) for any errors
```

### Test 2: API Endpoints
```
1. Open http://localhost/webdev/php/prescription.php?action=getMedicines
2. Should return JSON with medicine list
3. Check response has 'success': true
```

### Test 3: Database Connectivity
```
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Click on 'vitalsoft_db'
3. Verify tables exist:
   - users, roles, patients, medicines, prescriptions, orders, etc.
4. Check sample data exists (browse users table)
```

### Test 4: File Permissions
```
1. Verify all files are readable
2. Right-click file → Properties → Security
3. Ensure your user has READ permission
4. If issues, grant MODIFY permission to Users group
```

---

## 🚨 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| Access denied for user 'root' | Wrong MySQL password | Check config.php DB_PASS |
| Unknown database 'vitalsoft_db' | DB not created | Run setup script |
| Table 'users' doesn't exist | Tables not created | Run full setup |
| HTTP 500 Internal Server Error | PHP syntax error | Check error logs |
| CORS blocking API calls | Browser security | Use same domain (localhost) |
| Login page blank | Missing CSS/JS files | Check file paths in HTML |

---

## 📝 Useful Commands

### MySQL Command Line
```powershell
# Access MySQL
cd C:\wamp64\bin\mysql\mysql8.0.31\bin
mysql -u root

# In MySQL:
USE vitalsoft_db;
SHOW TABLES;
SELECT COUNT(*) FROM users;
```

### Start/Stop WAMP Services
```powershell
# Via WAMP Manager GUI (recommended)
# Click icon → Start All Services / Stop All Services

# Or use Command Line (advanced)
net start wampapache
net start wampmysqld
net stop wampapache
net stop wampmysqld
```

### Check Apache Status
```powershell
# Verify Apache running
http://localhost/

# Should show Apache welcome page
```

---

## 📞 Support Resources

### WAMP Documentation
- https://www.wampserver.com/en/

### MySQL Documentation
- https://dev.mysql.com/doc/

### PHP Documentation
- https://www.php.net/docs.php

### Project README
- See README.md in project root

---

## ✅ Final Checklist

Before deploying to production:

- [ ] WAMP64 installed and running
- [ ] MySQL service started
- [ ] Apache service started
- [ ] Database created (vitalsoft_db)
- [ ] All tables created
- [ ] Sample data inserted
- [ ] Login page loads at localhost/webdev/html/login.html
- [ ] Can login with admin/admin123
- [ ] Prescriptions API returns data
- [ ] Patient data loads correctly
- [ ] No console errors in browser (F12)
- [ ] phpMyAdmin accessible

---

## 🎉 You're All Set!

Your VitalSoft system is ready to use!

### Next Steps:
1. 🌐 Open: http://localhost/webdev/html/login.html
2. 🔐 Login with: admin / admin123
3. 📊 Explore the Admin Dashboard
4. 👨‍⚕️ Try other roles (doctor, pharmacist, patient)
5. 🚀 Customize as needed

---

**Last Updated:** November 18, 2025
**Project:** VitalSoft Pharmacy Management System
**Version:** 1.0.0


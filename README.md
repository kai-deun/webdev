# 🏥 VitalSoft - Pharmacy Management System

A comprehensive pharmacy management system for handling prescriptions, medicines, inventory, and multi-branch operations.

## 🚀 Quick Start (5 Minutes)

### Windows WAMP64 Setup

```powershell
# 1. Start WAMP64 and wait for GREEN icon
# 2. Open browser and visit:
http://localhost/webdev/setup/setup_database.php

# 3. Click "Start Setup" and wait for completion
# 4. Click "Open Login Page"
# 5. Login with: admin / admin123
```

### Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| **Admin** | admin | admin123 |
| **Doctor** | doctor | doctor123 |
| **Pharmacist** | pharmacist | pharma123 |
| **Manager** | manager | manager123 |
| **Patient** | patient | patient123 |

---

## 📋 System Requirements

- **OS:** Windows 10/11 64-bit
- **Web Server:** Apache (via WAMP64)
- **Database:** MySQL 5.7+ (via WAMP64)
- **PHP:** 7.4+ (via WAMP64)
- **Browser:** Chrome, Firefox, Edge, Safari

### WAMP64 Installation

1. Download from: https://www.wampserver.com/en/
2. Run installer as Administrator
3. Complete installation with default settings
4. Start WAMP from Windows Start Menu

---

## 📁 Project Structure

```
webdev/
├── 📄 SETUP_GUIDE.md                 ← Detailed setup instructions
├── 📄 README.md                      ← This file
├── 🚀 START_VITALSOF.bat             ← Quick start script
│
├── 📂 setup/
│   └── setup_database.php            ← Database initialization wizard
│
├── 📂 html/                          ← Frontend pages
│   ├── login.html                    ← Login page
│   ├── Admin.html                    ← Admin dashboard
│   ├── Doctor.html                   ← Doctor dashboard
│   ├── patient.html                  ← Patient portal
│   ├── Pharmacy Manager.html         ← Manager dashboard
│   └── Pharmacy Employees.html       ← Pharmacist dashboard
│
├── 📂 css/                           ← Stylesheets
│   ├── login.css
│   ├── admin.css
│   ├── patient.css
│   ├── doctor.css
│   ├── pharmacy-manager.css
│   └── pharmacy-employee.css
│
├── 📂 js/                            ← JavaScript modules
│   ├── login.js                      ← Login functionality
│   ├── common.js                     ← Shared utilities
│   ├── admin.js                      ← Admin functions
│   ├── patient.js                    ← Patient functions
│   ├── Medicine.js                   ← Medicine management
│   ├── Prescriptions.js              ← Prescription handling
│   ├── Displays.js                   ← UI display functions
│   ├── EventBinder.js                ← Event listeners
│   └── more...
│
├── 📂 php/                           ← Backend API endpoints
│   ├── config.php                    ← Database configuration
│   ├── auth.php                      ← Authentication/login
│   ├── prescription.php              ← Prescription CRUD
│   └── more endpoints...
│
└── 📂 database/
    ├── maindb.sql                    ← Main database schema
    └── prescription_db.sql           ← Additional prescriptions
```

---

## 🔧 Installation Steps

### Step 1: Verify WAMP64 Installation
```
1. Open Windows Start Menu
2. Type "WAMP" and click "WAMP Server"
3. Click system tray icon → should be GREEN
4. All services running (Apache, MySQL, PHP)
```

### Step 2: Initialize Database
```
1. Open browser: http://localhost/webdev/setup/setup_database.php
2. Click "Start Setup"
3. Wait for all ✓ marks (completion indicators)
4. Click "Open Login Page"
```

### Step 3: Access Application
```
1. URL: http://localhost/webdev/html/login.html
2. Login with demo credentials
3. Explore respective dashboard
```

---

## 🔐 Features by Role

### Admin Dashboard
- ✅ User management
- ✅ Role assignment
- ✅ System settings
- ✅ Activity logs
- ✅ Branch management
- ✅ Full system access

### Doctor Dashboard
- ✅ Patient management
- ✅ Create prescriptions
- ✅ Manage prescriptions
- ✅ View patient history
- ✅ Track prescriptions

### Pharmacist Dashboard
- ✅ Dispense medications
- ✅ Manage inventory
- ✅ Process orders
- ✅ Track stock
- ✅ Generate reports

### Pharmacy Manager Dashboard
- ✅ Branch management
- ✅ Staff scheduling
- ✅ Inventory oversight
- ✅ Sales reports
- ✅ Performance metrics

### Patient Portal
- ✅ View prescriptions
- ✅ Medical history
- ✅ Request renewals
- ✅ Support tickets

---

## 📊 Database Schema

### Core Tables
- **users** - System users with roles
- **roles** - User role definitions
- **patients** - Patient profiles
- **medicines** - Medicine catalog
- **prescriptions** - Prescription records
- **prescription_items** - Medicines per prescription
- **orders** - Dispensing records
- **branch_inventory** - Stock management
- **medical_history** - Patient medical records

### Total Tables: 20+
All with proper relationships, indexing, and constraints

---

## 🔗 API Endpoints

### Authentication
```
POST   /php/auth.php?action=login              ← User login
GET    /php/auth.php?action=logout             ← User logout
GET    /php/auth.php?action=getCurrentUser     ← Get current user
```

### Prescriptions
```
GET    /php/prescription.php?action=getPatients           ← List patients
GET    /php/prescription.php?action=getMedicines          ← List medicines
GET    /php/prescription.php?action=getPrescriptions      ← List all prescriptions
GET    /php/prescription.php?action=getPrescriptionDetails&id=1  ← Get single
POST   /php/prescription.php?action=savePrescription      ← Create/update
POST   /php/prescription.php?action=deletePrescription    ← Delete
```

All endpoints return JSON responses with `success`, `message`, and `data` fields.

---

## ⚙️ Configuration

File: `php/config.php`

```php
// Database
DB_HOST = 'localhost'
DB_NAME = 'vitalsoft_db'
DB_USER = 'root'
DB_PASS = ''              // Empty by default

// Application
APP_NAME = 'VitalSoft'
SESSION_TIMEOUT = 3600    // 1 hour
```

All PHP files include this configuration automatically.

---

## 🚨 Troubleshooting

### Database Connection Failed
```
✓ Check WAMP icon is GREEN (all services running)
✓ Verify MySQL is running: WAMP → MySQL → Running
✓ Confirm config.php has correct credentials
✓ Re-run setup: http://localhost/webdev/setup/setup_database.php
```

### Login Not Working
```
✓ Clear browser cache (Ctrl + Shift + Delete)
✓ Verify demo user exists in phpMyAdmin
✓ Check browser console (F12) for errors
✓ Ensure PHP sessions are enabled
```

### Setup Page Not Found
```
✓ Verify file exists: C:\wamp64\www\webdev\setup\setup_database.php
✓ If missing, create using provided code
✓ Restart Apache: WAMP → Apache → Restart Service
```

### Tables Don't Exist
```
✓ Re-run database setup
✓ Check for error messages
✓ Verify MySQL has permission to create tables
✓ Check MySQL error log
```

---

## 📝 Common Tasks

### Reset Database
```
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Select 'vitalsoft_db'
3. Click "Drop" → Confirm
4. Re-run setup: http://localhost/webdev/setup/setup_database.php
```

### Add New User
```
1. Admin Dashboard → User Management
2. Click "Add User"
3. Fill form and submit
4. User can login with credentials
```

### Change Medicine Price
```
1. Admin Dashboard → Medicine Management
2. Find medicine and edit
3. Update price
4. Save changes
```

### View Reports
```
1. Admin Dashboard → Reports
2. Select report type
3. Choose date range
4. Generate and download
```

---

## 🔒 Security Features

- ✅ Bcrypt password hashing
- ✅ SQL injection prevention (prepared statements)
- ✅ Session-based authentication
- ✅ Role-based access control (RBAC)
- ✅ CORS protection
- ✅ XSS protection headers
- ✅ Input validation and sanitization

---

## 📊 Sample Data

The system comes with sample data:
- 5 users (admin, doctors, pharmacists, manager, patients)
- 4 pharmacy branches
- 10 medicines
- 5 prescriptions with items
- 4 dispensed orders
- Medical history and patient records

**Note:** Sample passwords are hashed with bcrypt

---

## 🛠️ Development

### Add New API Endpoint
```php
// In php/your_endpoint.php
<?php
header('Content-Type: application/json');
require_once 'config.php';

$action = $_GET['action'] ?? '';

switch($action) {
    case 'getData':
        getData();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function getData() {
    $mysqli = getDBConnection();
    // Your code here
    $mysqli->close();
}
?>
```

### Update Frontend
```javascript
// In js/your_module.js
const API = '/php/your_endpoint.php';

async function getData() {
    const response = await fetch(`${API}?action=getData`);
    const data = await response.json();
    if (data.success) {
        // Handle data
    }
}
```

---

## 📚 Documentation Files

- **SETUP_GUIDE.md** - Detailed setup with troubleshooting
- **README.md** - This file (overview)
- **Code Comments** - Each file has detailed comments

---

## 🧪 Testing

### Test Login
```
URL: http://localhost/webdev/html/login.html
Username: admin
Password: admin123
Expected: Redirect to Admin dashboard
```

### Test API
```
URL: http://localhost/webdev/php/prescription.php?action=getMedicines
Expected: JSON response with medicine list
```

### Test Database
```
URL: http://localhost/phpmyadmin
Database: vitalsoft_db
Tables: 20+ tables visible
Data: Sample records exist
```

---

## 📞 Support Resources

| Resource | Link |
|----------|------|
| WAMP Documentation | https://www.wampserver.com/en/ |
| MySQL Docs | https://dev.mysql.com/doc/ |
| PHP Docs | https://www.php.net/docs.php |
| MDN Web Docs | https://developer.mozilla.org/ |

---

## ✅ Pre-Launch Checklist

Before going live:

- [ ] WAMP installed and running
- [ ] Database created and populated
- [ ] Login works with all roles
- [ ] All APIs return correct data
- [ ] No console errors (F12)
- [ ] Patient data loads correctly
- [ ] Prescriptions can be created
- [ ] Inventory is accessible
- [ ] Reports generate correctly
- [ ] phpMyAdmin accessible

---

## 🎯 Performance Tips

- Use indexes on frequently searched columns (already done)
- Optimize images and assets
- Cache API responses where possible
- Use CDN for static files
- Monitor database query performance
- Regular database maintenance

---

## 🚀 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Insurance integration
- [ ] Payment gateway
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Barcode scanning

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 👨‍💻 Author & Support

**VitalSoft Development Team**

For issues or questions:
1. Check SETUP_GUIDE.md
2. Review code comments
3. Check browser console (F12)
4. Review PHP error logs

---

## 🎉 You're Ready to Go!

1. **Start:** http://localhost/webdev/html/login.html
2. **Login:** admin / admin123
3. **Explore:** Admin Dashboard
4. **Enjoy:** VitalSoft!

---

**Version:** 1.0.0  
**Last Updated:** November 18, 2025  
**Status:** Ready for Production

---

# ADMIN MODULE
## NODE dependencies

- npm init (creates package.json)

- npm install \<package\> (node-modules)

- express = framework and routing

- mysql2 = improved mysql

- dotenv = loads environment vars in the .env file

- bcryptjs = hash and compare passwords

- jsonwebtoken = authentication and session (API security)

- cors = cross-origin request (blocks request from diff. domain)

- body-parser = parse incoming request bodies

- helmet = set secure HTTP headers

- npm install --save-dev nodemon (automatic restart or the server)

- npx create-react-app frontend = (Create React App) </br> it's like a ready made template for the frontend

- npm install axios react-router-dom:
  
  - axios = makes HTTP requests to the APIs
  - react-router-dom = handles routing and navigation

## TREE STRUCTURE

- backend created manually:
- backend:
  - config
  - controllers
  - middleware
  - routes
  - node_modules (dependencies)
  - .env (sensitive info)
  - package.json
  - server.js
- frontend created via npx and npm but some files are created by the dev:
  - node_modules (dependencies)
  - public
  - src
    - components
    - pages
    - styles
    - App.js
    - services (manual creation)
  - .env
  - package.json

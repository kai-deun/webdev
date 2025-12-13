# JavaScript Directory Structure

This directory contains all JavaScript files organized by role/module for easier navigation and maintenance.

## Directory Structure

```
js/
├── common/          # Shared utilities (no dependencies)
│   ├── common.js    # Authentication, session management, global utilities
│   └── login.js     # Login page functionality
│
├── prescription/    # Shared prescription module (used by doctor portal)
│   ├── Instances.js         # Dependency injection container
│   ├── PrescriptionObject.js # Prescription data model
│   ├── Prescriptions.js     # Prescription display/management logic
│   ├── Patient.js           # Patient selection and management
│   ├── Displays.js          # Render functions for prescription views
│   ├── EventBinder.js       # Event handlers for prescription UI
│   └── Medicine.js          # Medicine management (add/remove/suggestions)
│
├── doctor/          # Doctor portal modules
│   ├── PrescriptionManager.js   # Main doctor dashboard controller (entry point)
│   └── PrescriptionUtilities.js # API calls and business logic for prescriptions
│
├── patient/         # Patient portal modules
│   └── PatientDashboard.js  # Patient dashboard stats and initialization (standalone)
│
├── manager/         # Pharmacy Manager portal modules (self-contained)
│   ├── ManagerMain.js        # Main entry point
│   ├── ManagerInstances.js   # Dependency injection
│   ├── ManagerUtilities.js   # API calls and business logic
│   ├── ManagerDisplays.js    # Render functions
│   ├── ManagerEventBinder.js # Event handlers
│   ├── ManagerModals.js      # Modal dialogs
│   ├── ManagerObject.js      # Data model
│   └── PharmacyManager.js    # Additional utilities
│
├── pharmacist/      # Pharmacist portal modules (standalone)
│   ├── PharmacyEmployee.js  # Main pharmacist functionality
│   └── PhEmployeeUtil.js    # Pharmacist utilities
│
└── admin/           # Admin portal modules (standalone)
    └── admin.js     # Admin dashboard functionality
```

## Module Dependencies

### Entry Points (loaded by HTML):
- **common/common.js** → Loaded by all portals (auth, global functions)
- **common/login.js** → Loaded by login.html
- **doctor/PrescriptionManager.js** → Entry for Doctor.html (ES6 module)
- **patient/PatientDashboard.js** → Entry for patient.html (standalone)
- **manager/ManagerMain.js** → Entry for Pharmacy Manager.html (ES6 module)
- **pharmacist/PharmacyEmployee.js** → Entry for PharmacyEmployees.html (standalone)
- **admin/admin.js** → Entry for Admin.html (standalone)

### Dependency Graph:
```
Doctor Portal:
  PrescriptionManager.js (entry)
    └─> prescription/Instances.js
          ├─> PrescriptionObject.js
          ├─> Prescriptions.js
          ├─> Patient.js
          ├─> Medicine.js
          ├─> Displays.js
          ├─> EventBinder.js
          └─> doctor/PrescriptionUtilities.js

Manager Portal:
  ManagerMain.js (entry)
    └─> ManagerInstances.js
          ├─> ManagerObject.js
          ├─> ManagerUtilities.js
          ├─> ManagerDisplays.js
          └─> ManagerEventBinder.js

Patient/Pharmacist/Admin:
  Standalone files with no ES6 imports
```

## Usage in HTML Files

```html
<!-- Patient Portal -->
<script src="../js/common/common.js"></script>
<script src="../js/patient/PatientDashboard.js"></script>

<!-- Doctor Portal -->
<script src="../js/common/common.js"></script>
<script src="../js/doctor/PrescriptionManager.js" type="module"></script>

<!-- Manager Portal -->
<script src="../js/common/common.js"></script>
<script type="module" src="../js/manager/ManagerMain.js"></script>

<!-- Pharmacist Portal -->
<script src="../js/pharmacist/PharmacyEmployee.js"></script>

<!-- Admin Portal -->
<script src="../js/admin/admin.js"></script>

<!-- Login Page -->
<script src="../js/common/login.js"></script>
```

## Architecture Notes

1. **ES6 Modules**: Only doctor and manager portals use ES6 modules with imports
2. **Standalone Scripts**: Patient, pharmacist, and admin use traditional script loading
3. **Shared Code**: `common/` contains truly shared utilities (auth, session)
4. **Prescription Module**: Centralized prescription logic used exclusively by doctor portal
5. **Circular Dependencies**: Avoided through dependency injection pattern (Instances.js)

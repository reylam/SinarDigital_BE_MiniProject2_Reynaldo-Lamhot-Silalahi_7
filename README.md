# SinarDigital Backend API

REST API untuk sistem manajemen internal perusahaan **SinarDigital**, meliputi autentikasi, manajemen pengguna, tugas, rekrutmen, dan laporan perusahaan.

---

## 📋 Fitur Utama

- ✅ **Authentication System** — Login/Logout menggunakan token  
- ✅ **User Management** — Multi-role: C-Level, HRD, Staff  
- ✅ **Task Management** — Membuat, meng-assign, dan mengupdate tugas  
- ✅ **Job Recruitment** — Manajemen lowongan dan pelamar  
- ✅ **Role-based Authorization** — Akses berdasarkan role & permission  

---

## 📚 API Endpoints

### 🔐 Authentication

| Method | Endpoint      | Deskripsi                                 |
|--------|---------------|--------------------------------------------|
| POST   | `/api/login`  | Login user dan generate token             |
| POST   | `/api/logout` | Logout user dan revoke token              |

---

### 👤 Users

| Method | Endpoint                  | Deskripsi                              |
|--------|---------------------------|------------------------------------------|
| GET    | `/api/users`             | Get semua users (C-Level only)          |
| GET    | `/api/users/me`          | Get profile user login                  |
| PUT    | `/api/users/:id/status`  | Update status aktif/nonaktif user       |

---

### 📝 Tasks

| Method | Endpoint          | Deskripsi                        |
|--------|-------------------|----------------------------------|
| GET    | `/api/tasks`      | Get semua tasks                  |
| POST   | `/api/tasks`      | Buat task baru                   |
| PUT    | `/api/tasks/:id`  | Update task                      |

---

### 💼 Jobs

| Method | Endpoint      | Deskripsi                          |
|--------|---------------|--------------------------------------|
| GET    | `/api/jobs`   | Get semua jobs (public)             |
| POST   | `/api/jobs`   | Buat job baru (HRD only)            |

---

### 👥 Job Applicants

| Method | Endpoint                           | Deskripsi                         |
|--------|------------------------------------|-----------------------------------|
| GET    | `/api/job-seekers`                 | Get semua pelamar (HRD only)      |
| GET    | `/api/jobs/:jobId/applicants`      | Get pelamar by job (HRD only)     |
| POST   | `/api/job-seekers`                 | Apply untuk job (public)          |

---

### 📊 Reports

| Method | Endpoint                   | Deskripsi                              |
|--------|----------------------------|------------------------------------------|
| GET    | `/api/reports/dashboard`  | Get dashboard data (C-Level & HRD)      |

---

## 🛡 Authorization

### **C-Level**
- Manage users & company  
- View reports & approve budgets  

### **HRD**
- Manage jobs & review applicants  
- View reports  

### **Staff**
- Hanya mengerjakan task assigned ke mereka  

---

## 📁 Important Files

| File                                           | Deskripsi                               |
|------------------------------------------------|-------------------------------------------|
| `TPM_BE_MiniProject1.postman_collection.json` | Postman collection untuk testing API       |
| `data.json`                                   | Database file (JSON-based)                |
| `ERD.png`                                     | Entity Relationship Diagram                |


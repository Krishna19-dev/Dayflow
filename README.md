# Dayflow HRMS ⚡
> **Next-Gen Enterprise Workforce & Payroll Management Engine**  
> Built for speed, security, and scale using **Next.js 14 (App Router)** and **Prisma ORM** over **PostgreSQL**.

---

## 🚀 Why Dayflow? (The Tech Flex)

### 💎 Next.js 14+ App Router & Edge Architecture
* **Edge-Powered RBAC Middleware**: Sub-millisecond JWT authentication & route shielding at the Edge using `jose` — unauthorized requests are intercepted before hitting the Node runtime.
* **Hybrid Server & Client Paradigms**: Server-rendered layouts for instant initial paint paired with responsive Client Components for real-time reactivity.
* **Strict Type-Safe API Routes**: Next.js Route Handlers strictly guarded with **Zod** schema validation and role-based guards.

### 🛡️ Prisma ORM & PostgreSQL Mastery
* **Complex Relational Modeling**: 1:1 cascades (`PrivateInfo`, `SalaryInfo`, `Resume`), 1:N relations (`Attendance`, `LeaveAllocation`, `LeaveRequest`), and self-referential hierarchies (`managerId`).
* **Atomic Nested Writes**: Zero-friction data provisioning — creating an employee automatically provisions their salary matrix, leave allocations, and KYC data in a single atomic operation.
* **Enterprise Indexing & Enums**: Native PostgreSQL enums, composite unique constraints (`[employeeId, date]`), and indexed query paths for lightning-fast search & filtering.

---

## ✨ Core Highlights

| Module | Features & Capabilities |
| :--- | :--- |
| 👥 **Employee Lifecycle** | Algorithmic Login ID generator (`[Company][Initials][Year][Serial]`), tabbed profile (KYC, Skills, Resume), and role-based data shielding. |
| ⏱️ **Attendance & Overtime** | One-click real-time check-in/out widget, auto-calculated work duration, overtime tracking (>8h), and workforce calendars. |
| 🌴 **Time Off & Approvals** | Multi-tier leave balances (PTO, Sick, Unpaid), automated approval engine with dynamic attendance backfill & calendar heatmaps. |
| 💰 **Dynamic Payroll Engine** | Real-time salary breakdown (Basic, HRA, Allowances, PF, Professional Tax) with percentage validation and net pay estimation. |

---

## ⚡ Quick Start (3 Steps)

### 1. Clone & Install
```bash
git clone https://github.com/Krishna19-dev/Dayflow.git
cd Dayflow
npm install
```

### 2. Configure Environment & Push Database
Create `.env` (using `.env.example` as a template):
```env
DATABASE_URL="your-postgresql-url"
DIRECT_URL="your-postgresql-direct-url"
JWT_SECRET="super-secret-key-2026"
COMPANY_CODE="OI"
```
Sync schema and seed initial demo data:
```bash
npx prisma db push
npx prisma db seed
```

### 3. Launch Development Server
```bash
npm run dev
```
Visit **[http://localhost:3000](http://localhost:3000)** 🎉

---

## 🔑 Demo Accounts (Pre-Seeded)

| Department | Role | Name | Login ID | Email | Password |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Human Resources** | **👑 ADMIN** | Krishna | `OIADMI20260001` | `admin@dayflow.com` | `Admin@12345` |
| **Engineering** | **👤 EMPLOYEE** | Aarav Sharma (2-Day Leave Case) | `OIAASH20260002` | `aarav.sharma@dayflow.com` | `Employee@123` |
| **Engineering** | **👤 EMPLOYEE** | Vikram Malhotra (Overtime Star) | `OIVIMA20260005` | `vikram.malhotra@dayflow.com` | `Employee@123` |
| **Product Design** | **👤 EMPLOYEE** | Rohan Gupta (Sick + Half Day Case) | `OIROGU20260003` | `rohan.gupta@dayflow.com` | `Employee@123` |
| **Marketing** | **👤 EMPLOYEE** | Priya Sharma (Vacation Case) | `OIPRSH20260004` | `priya.sharma@dayflow.com` | `Employee@123` |
| **Sales** | **👤 EMPLOYEE** | Siddharth Rao (Sales Director) | `OISIRA20260026` | `siddharth.rao@dayflow.com` | `Employee@123` |
| **Operations** | **👤 EMPLOYEE** | Alok Mishra (Head of Ops) | `OIALMI20260032` | `alok.mishra@dayflow.com` | `Employee@123` |
| **Finance** | **👤 EMPLOYEE** | Sanjay Singhal (CFO - 100% Present) | `OISASI20260038` | `sanjay.singhal@dayflow.com` | `Employee@123` |

> 💡 **Total Staff**: 43 employees across 7 departments with 1-month realistic attendance & leave profiles!

---

## 🛠️ Tech Stack
* **Framework**: Next.js 14+ (App Router, Server Actions, Route Handlers)
* **ORM & Database**: Prisma 5, PostgreSQL (Neon Serverless)
* **Auth**: Edge JWT (`jose`) + Node JWT (`jsonwebtoken`) + `bcryptjs`
* **Styling**: Tailwind CSS + Custom Design System
* **Icons**: Lucide React

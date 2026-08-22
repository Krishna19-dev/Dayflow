# Dayflow HRMS — Modern Enterprise Human Resource Management System

**Dayflow** is a full-stack, enterprise-grade Human Resource Management System built with **Next.js 14+ (App Router)**, **TypeScript**, **PostgreSQL with Prisma ORM**, **Tailwind CSS**, and **Edge/Node JWT Authentication**.

---

## Key Features

- **Enterprise Authentication & RBAC**:
  - Secure JWT authentication stored in `httpOnly` cookies (`jsonwebtoken` in Node API routes, `jose` in Edge `middleware.ts`).
  - Strict role-based authorization for **ADMIN** and **EMPLOYEE** roles.
  - Forced first-time password reset for newly provisioned accounts.
  - Colleague profile visibility safeguards (Salary Information strictly hidden from non-admin peers).

- **Employee Directory & Lifecycle**:
  - Live employee grid with real-time status dots (Present 🟢, On Leave ✈️, Absent 🟡).
  - Admin modal to create new staff with automated **Login ID generation** (`[CompanyCode][First2FirstName+First2LastName][JoinYear][SerialNumber]`) and temporary password generator.
  - Full tabbed profile management: **Resume & Skills**, **Private Information (KYC / Bank details)**, **Salary Structure (Admin only)**, and **Security**.

- **Attendance & Overtime Tracking**:
  - One-click Check In / Check Out controls with live widget in top navigation.
  - Automatic work hours and overtime calculation (>8 standard hours).
  - Role-aware ledger: Admin workforce calendar table vs. Employee monthly attendance overview with summary counters.

- **Time Off & Leave Management**:
  - Leave allocation tracking (**Paid Time Off: 24 days**, **Sick Leave: 7 days**, **Unpaid Leave**).
  - Request submission modal with date-range business day calculation and medical attachment support.
  - Admin approval/rejection workflow: upon approval, automatically increments used allocations and generates `LEAVE` attendance records across the date range in a database transaction.
  - Visual month **Calendar Heatmap** color-coding attendance, weekends, and approved leaves.

- **Dynamic Salary Calculation Engine**:
  - Auto-calculates component amounts from percentage shares of wage (Basic, HRA, Standard Allowance, Performance Bonus, LTA, Fixed Allowance).
  - Validates total component percentage sum ($\le 100\%$) in real-time.
  - Calculates Statutory Employee/Employer PF contributions and Professional Tax.
  - Computes gross earnings and estimated take-home net pay.

---

## Tech Stack & Architecture

- **Frontend**: Next.js 14+ (App Router), React 18, Tailwind CSS, Lucide Icons, Date-fns
- **Backend**: Next.js Route Handlers, Zod Validation, Bcryptjs
- **Database**: PostgreSQL with Prisma ORM (Native `String[]` arrays and Enums)
- **Auth**: Node `jsonwebtoken` + Edge `jose` for middleware protection

---

## Design & Color System

The application strictly implements the Dayflow enterprise color palette:

| Token | Hex / Value | Usage |
| :--- | :--- | :--- |
| `--color-primary` | `#191970` | Midnight Blue — Primary actions, active navigation tabs, brand mark |
| `--color-primary-hover` | `#2525A0` | Midnight Blue hover/focus states |
| `--color-background` | `#ECEFF1` | Mist Gray — Page and workspace background |
| `--color-surface` | `#FFFFFF` | White — Cards, modals, tables, forms |
| `--color-text-primary` | `#111827` | Near Black — Headings, titles, body text |
| `--color-text-secondary` | `#64748B` | Slate — Subtitles, helper text, metadata |
| `--color-border` | `#D7DCE0` | Light Gray — Component borders and dividers |
| `--color-success` | `#16A34A` | Semantic Green — Present, Approved status |
| `--color-warning` | `#F59E0B` | Semantic Amber — Pending status |
| `--color-error` | `#DC2626` | Semantic Red — Absent, Rejected status |
| `--color-half-day` | `#F97316` | Semantic Orange — Half-day status |

---

## Getting Started

### 1. Environment Setup

Copy `.env.example` to `.env.local` (or configure your `.env`):

```bash
cp .env.example .env.local
```

Ensure your `.env.local` contains valid database and secret keys:

```env
# Neon / PostgreSQL Database URL
DATABASE_URL="postgresql://user:password@host:5432/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@host:5432/neondb?sslmode=require"

# JWT Secret
JWT_SECRET="dayflow-hrms-production-super-secret-key-2026"

# Company Code prefix for Login ID generation (e.g. OIJODO20260001)
COMPANY_CODE="OI"

NODE_ENV="development"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Generate Prisma Client & Push Database Schema

```bash
npx prisma generate
npx prisma db push
# or for migrations:
# npx prisma migrate dev --name init
```

### 4. Seed the Database with Sample Data

```bash
npx prisma db seed
```

---

## Seed Accounts & Default Credentials

When seeded, the following initial accounts are available for immediate login:

| Role | Name | Login ID | Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Krishna | `OIADMI20260001` | `admin@dayflow.com` | `Admin@12345` | Full HR controls, employee creation, salary editing, leave review |
| **EMPLOYEE** | Aarav Sharma | `OIAASH20260002` | `aarav.sharma@dayflow.com` | `Employee@123` | Engineering department, full profile, sample attendance & PTO |
| **EMPLOYEE** | Rohan Gupta | `OIROGU20260003` | `rohan.gupta@dayflow.com` | `Employee@123` | Product Design, `mustChangePassword=true` (tests forced password change) |
| **EMPLOYEE** | Priya Sharma | `OIPRSH20260004` | `priya.sharma@dayflow.com` | `Employee@123` | Marketing department, approved leave history |

---

## Running the Application Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Verification & Quality Assurance

- Run TypeScript build check:
  ```bash
  npm run build
  ```
- Run linter:
  ```bash
  npm run lint
  ```

import { Role, WageType, AttendanceStatus, LeaveType, LeaveStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("🌱 Starting Dayflow HRMS database seed...");

  const seedEmails = [
    "admin@dayflow.com",
    "aarav.sharma@dayflow.com",
    "rohan.gupta@dayflow.com",
    "priya.sharma@dayflow.com",
    "sarah.jenkins@dayflow.com",
    "david.chen@dayflow.com"
  ];

  // Unlink manager and clean specific demo accounts
  await prisma.user.updateMany({
    where: { email: { in: seedEmails } },
    data: { managerId: null },
  });
  await prisma.leaveRequest.deleteMany({
    where: {
      OR: [
        { employee: { email: { in: seedEmails } } },
        { reviewedBy: { email: { in: seedEmails } } }
      ]
    }
  });
  await prisma.user.deleteMany({
    where: { email: { in: seedEmails } }
  });

  const adminHashedPassword = await bcrypt.hash("Admin@12345", 10);
  const employeeHashedPassword = await bcrypt.hash("Employee@123", 10);

  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // 1. Create ADMIN User
  const admin = await prisma.user.create({
    data: {
      loginId: "OIADMI20260001",
      name: "Krishna",
      email: "admin@dayflow.com",
      phone: "+91 98765 43210",
      password: adminHashedPassword,
      mustChangePassword: false,
      role: Role.ADMIN,
      company: "Dayflow Technologies",
      department: "Human Resources",
      location: "Bengaluru HQ",
      dateOfJoining: new Date("2024-01-15"),
      isActive: true,
      privateInfo: {
        create: {
          dateOfBirth: new Date("1988-06-14"),
          gender: "Male",
          maritalStatus: "Married",
          residingAddress: "402, Skyline Residency, Indiranagar, Bengaluru, Karnataka - 560038",
          nationality: "Indian",
          personalEmail: "krishna.hrms@gmail.com",
          panNo: "ABCDE1234F",
          uanNo: "100234567890",
          expCode: "EXP-HR-001",
          bankAccountNumber: "987654321001",
          bankName: "HDFC Bank",
          ifscCode: "HDFC0001234",
        },
      },
      resume: {
        create: {
          about: "Accomplished Human Resources leader with 12+ years of experience in talent strategy, workforce operations, and organizational scaling.",
          skills: ["Strategic HR", "Talent Acquisition", "Compensation & Benefits", "Compliance", "People Analytics"],
          certifications: ["SHRM-SCP", "OD Specialist", "Certified Compensation Professional"],
          interestsAndHobbies: "Marathon running, Chess, Classical music, Reading biography classics.",
        },
      },
      salaryInfo: {
        create: {
          wageType: WageType.FIXED,
          monthlyWage: 250000,
          yearlyWage: 3000000,
          workingDaysPerWeek: 5,
          breakTimeHours: 1.0,
          basicSalaryPercent: 50.0,
          hraPercent: 20.0,
          standardAllowancePercent: 10.0,
          performanceBonusPercent: 10.0,
          leaveTravelAllowancePercent: 5.0,
          fixedAllowancePercent: 5.0,
          employeePfPercent: 12.0,
          employerPfPercent: 12.0,
          professionalTax: 200.0,
        },
      },
      leaveAllocations: {
        create: [
          { leaveType: LeaveType.PAID_TIME_OFF, totalAllocated: 24, used: 3 },
          { leaveType: LeaveType.SICK_LEAVE, totalAllocated: 7, used: 0 },
          { leaveType: LeaveType.UNPAID_LEAVE, totalAllocated: 0, used: 0 },
        ],
      },
      attendances: {
        create: {
          date: todayOnly,
          checkInTime: new Date(todayOnly.getTime() + 9 * 3600 * 1000), // 9:00 AM
          workHours: 4.5,
          extraHours: 0,
          status: AttendanceStatus.PRESENT,
        },
      },
    },
  });

  // 2. Create Employee 1 - Aarav Sharma (Senior Full Stack Engineer)
  const emp1 = await prisma.user.create({
    data: {
      loginId: "OIAASH20260002",
      name: "Aarav Sharma",
      email: "aarav.sharma@dayflow.com",
      phone: "+91 98765 11111",
      password: employeeHashedPassword,
      mustChangePassword: false,
      role: Role.EMPLOYEE,
      company: "Dayflow Technologies",
      department: "Engineering",
      location: "Bengaluru HQ",
      managerId: admin.id,
      dateOfJoining: new Date("2024-03-01"),
      isActive: true,
      privateInfo: {
        create: {
          dateOfBirth: new Date("1994-09-22"),
          gender: "Male",
          maritalStatus: "Single",
          residingAddress: "12, Palm Meadows, Whitefield, Bengaluru, Karnataka - 560066",
          nationality: "Indian",
          personalEmail: "aarav.sharma.dev@gmail.com",
          panNo: "FGHIJ5678K",
          uanNo: "100987654321",
          expCode: "EXP-ENG-042",
          bankAccountNumber: "50100456789123",
          bankName: "ICICI Bank",
          ifscCode: "ICIC0000501",
        },
      },
      resume: {
        create: {
          about: "Full Stack Engineer passionate about building scalable cloud applications, distributed microservices, and slick reactive web UI.",
          skills: ["TypeScript", "Next.js", "React", "PostgreSQL", "Prisma", "Docker", "AWS", "GraphQL"],
          certifications: ["AWS Certified Solutions Architect", "CKA - Certified Kubernetes Administrator", "Meta Front-End Specialization"],
          interestsAndHobbies: "Open source contributing, badminton, photography, tech blogging.",
        },
      },
      salaryInfo: {
        create: {
          wageType: WageType.FIXED,
          monthlyWage: 150000,
          yearlyWage: 1800000,
          workingDaysPerWeek: 5,
          breakTimeHours: 1.0,
          basicSalaryPercent: 50.0,
          hraPercent: 20.0,
          standardAllowancePercent: 10.0,
          performanceBonusPercent: 10.0,
          leaveTravelAllowancePercent: 5.0,
          fixedAllowancePercent: 5.0,
          employeePfPercent: 12.0,
          employerPfPercent: 12.0,
          professionalTax: 200.0,
        },
      },
      leaveAllocations: {
        create: [
          { leaveType: LeaveType.PAID_TIME_OFF, totalAllocated: 24, used: 2 },
          { leaveType: LeaveType.SICK_LEAVE, totalAllocated: 7, used: 1 },
          { leaveType: LeaveType.UNPAID_LEAVE, totalAllocated: 0, used: 0 },
        ],
      },
      attendances: {
        create: {
          date: todayOnly,
          checkInTime: new Date(todayOnly.getTime() + 9.25 * 3600 * 1000), // 9:15 AM
          workHours: 4.25,
          extraHours: 0,
          status: AttendanceStatus.PRESENT,
        },
      },
    },
  });

  // 3. Create Employee 2 - Rohan Gupta (Lead UI/UX Designer - mustChangePassword: true)
  const emp2 = await prisma.user.create({
    data: {
      loginId: "OIROGU20260003",
      name: "Rohan Gupta",
      email: "rohan.gupta@dayflow.com",
      phone: "+91 98765 22222",
      password: employeeHashedPassword,
      mustChangePassword: true, // Test forced redirect
      role: Role.EMPLOYEE,
      company: "Dayflow Technologies",
      department: "Product Design",
      location: "Mumbai Tech Park",
      managerId: admin.id,
      dateOfJoining: new Date("2024-06-10"),
      isActive: true,
      privateInfo: {
        create: {
          dateOfBirth: new Date("1992-11-05"),
          gender: "Male",
          maritalStatus: "Married",
          residingAddress: "Flat 801, Sea View Towers, Bandra West, Mumbai, Maharashtra - 400050",
          nationality: "Indian",
          personalEmail: "rohan.gupta.design@gmail.com",
          panNo: "KLMNO9012P",
          uanNo: "100554433221",
          expCode: "EXP-DES-018",
          bankAccountNumber: "309876543210",
          bankName: "State Bank of India",
          ifscCode: "SBIN0001822",
        },
      },
      resume: {
        create: {
          about: "Product Designer obsessed with crafting cohesive design systems, micro-interactions, and accessible web experiences for SaaS platforms.",
          skills: ["Figma", "Design Systems", "User Research", "Wireframing", "Prototyping", "Tailwind CSS"],
          certifications: ["Nielsen Norman UX Master", "Interaction Design Foundation Specialist"],
          interestsAndHobbies: "Architectural sketching, espresso brewing, cycling, typography history.",
        },
      },
      salaryInfo: {
        create: {
          wageType: WageType.FIXED,
          monthlyWage: 130000,
          yearlyWage: 1560000,
          workingDaysPerWeek: 5,
          breakTimeHours: 1.0,
          basicSalaryPercent: 50.0,
          hraPercent: 20.0,
          standardAllowancePercent: 10.0,
          performanceBonusPercent: 10.0,
          leaveTravelAllowancePercent: 5.0,
          fixedAllowancePercent: 5.0,
          employeePfPercent: 12.0,
          employerPfPercent: 12.0,
          professionalTax: 200.0,
        },
      },
      leaveAllocations: {
        create: [
          { leaveType: LeaveType.PAID_TIME_OFF, totalAllocated: 24, used: 0 },
          { leaveType: LeaveType.SICK_LEAVE, totalAllocated: 7, used: 0 },
          { leaveType: LeaveType.UNPAID_LEAVE, totalAllocated: 0, used: 0 },
        ],
      },
      attendances: {
        create: {
          date: todayOnly,
          checkInTime: null,
          workHours: 0,
          extraHours: 0,
          status: AttendanceStatus.ABSENT,
        },
      },
    },
  });

  // 4. Create Employee 3 - Priya Sharma (Senior Marketing Lead)
  const emp3 = await prisma.user.create({
    data: {
      loginId: "OIPRSH20260004",
      name: "Priya Sharma",
      email: "priya.sharma@dayflow.com",
      phone: "+91 98765 33333",
      password: employeeHashedPassword,
      mustChangePassword: false,
      role: Role.EMPLOYEE,
      company: "Dayflow Technologies",
      department: "Marketing",
      location: "Delhi Hub",
      managerId: admin.id,
      dateOfJoining: new Date("2024-04-18"),
      isActive: true,
      privateInfo: {
        create: {
          dateOfBirth: new Date("1995-02-18"),
          gender: "Female",
          maritalStatus: "Single",
          residingAddress: "B-44, Greater Kailash 1, New Delhi, Delhi - 110048",
          nationality: "Indian",
          personalEmail: "priya.growth@gmail.com",
          panNo: "PQRST3456U",
          uanNo: "100778899001",
          expCode: "EXP-MKT-009",
          bankAccountNumber: "002201567890",
          bankName: "Axis Bank",
          ifscCode: "UTIB0000022",
        },
      },
      resume: {
        create: {
          about: "Growth Marketing specialist driving SaaS product adoption, SEO architecture, developer community evangelism, and demand gen.",
          skills: ["Growth Marketing", "B2B SaaS Strategy", "Content Strategy", "SEO", "HubSpot", "Google Analytics"],
          certifications: ["Google Analytics 4 Certified", "HubSpot Inbound Marketing Master"],
          interestsAndHobbies: "Podcasting, badminton, creative writing, gourmet cooking.",
        },
      },
      salaryInfo: {
        create: {
          wageType: WageType.FIXED,
          monthlyWage: 110000,
          yearlyWage: 1320000,
          workingDaysPerWeek: 5,
          breakTimeHours: 1.0,
          basicSalaryPercent: 50.0,
          hraPercent: 20.0,
          standardAllowancePercent: 10.0,
          performanceBonusPercent: 10.0,
          leaveTravelAllowancePercent: 5.0,
          fixedAllowancePercent: 5.0,
          employeePfPercent: 12.0,
          employerPfPercent: 12.0,
          professionalTax: 200.0,
        },
      },
      leaveAllocations: {
        create: [
          { leaveType: LeaveType.PAID_TIME_OFF, totalAllocated: 24, used: 4 },
          { leaveType: LeaveType.SICK_LEAVE, totalAllocated: 7, used: 0 },
          { leaveType: LeaveType.UNPAID_LEAVE, totalAllocated: 0, used: 0 },
        ],
      },
      attendances: {
        create: {
          date: todayOnly,
          checkInTime: null,
          workHours: 0,
          extraHours: 0,
          status: AttendanceStatus.LEAVE,
        },
      },
    },
  });

  // 5. Create Sample Leave Requests
  // Approved Leave for Priya
  const pastLeaveStart = new Date(todayOnly.getTime() - 2 * 86400000);
  const pastLeaveEnd = new Date(todayOnly.getTime() + 1 * 86400000);
  await prisma.leaveRequest.create({
    data: {
      employeeId: emp3.id,
      leaveType: LeaveType.PAID_TIME_OFF,
      startDate: pastLeaveStart,
      endDate: pastLeaveEnd,
      allocationDays: 4,
      status: LeaveStatus.APPROVED,
      reviewedById: admin.id,
      reviewComment: "Approved. Enjoy your vacation!",
    },
  });

  // Pending Leave for Aarav
  const futureLeaveStart = new Date(todayOnly.getTime() + 7 * 86400000);
  const futureLeaveEnd = new Date(todayOnly.getTime() + 8 * 86400000);
  await prisma.leaveRequest.create({
    data: {
      employeeId: emp1.id,
      leaveType: LeaveType.PAID_TIME_OFF,
      startDate: futureLeaveStart,
      endDate: futureLeaveEnd,
      allocationDays: 2,
      status: LeaveStatus.PENDING,
      attachmentUrl: null,
    },
  });

  // Pending Sick Leave for Rohan
  await prisma.leaveRequest.create({
    data: {
      employeeId: emp2.id,
      leaveType: LeaveType.SICK_LEAVE,
      startDate: todayOnly,
      endDate: todayOnly,
      allocationDays: 1,
      status: LeaveStatus.PENDING,
      attachmentUrl: "https://dayflow.internal/attachments/doctor-prescription.pdf",
    },
  });

  console.log("\n========================================================");
  console.log("🚀 DAYFLOW HRMS SEED COMPLETED SUCCESSFULLY");
  console.log("========================================================");
  console.log("🔑 ADMIN CREDENTIALS:");
  console.log("   • Login ID : OIADMI20260001");
  console.log("   • Email    : admin@dayflow.com");
  console.log("   • Password : Admin@12345");
  console.log("--------------------------------------------------------");
  console.log("👤 SAMPLE EMPLOYEES:");
  console.log("   • Aarav Sharma (Engineering)  : OIAASH20260002 / Employee@123");
  console.log("   • Rohan Gupta  (Design - Must Reset Pwd): OIROGU20260003 / Employee@123");
  console.log("   • Priya Sharma (Marketing)    : OIPRSH20260004 / Employee@123");
  console.log("========================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

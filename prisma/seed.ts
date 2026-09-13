import { Role, WageType, AttendanceStatus, LeaveType, LeaveStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

interface EmployeeSeedDefinition {
  loginId: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  department: string;
  company: string;
  location: string;
  mustChangePassword?: boolean;
  dateOfJoining: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  address: string;
  panNo: string;
  uanNo: string;
  expCode: string;
  bankName: string;
  bankAccount: string;
  ifsc: string;
  about: string;
  skills: string[];
  certifications: string[];
  hobbies: string;
  monthlyWage: number;
}

const EMPLOYEES: EmployeeSeedDefinition[] = [
  // ==========================================
  // 1. HUMAN RESOURCES (Admin + 5 Employees = 6)
  // ==========================================
  {
    loginId: "OIADMI20260001",
    name: "Krishna",
    email: "admin@dayflow.com",
    phone: "+91 98765 43210",
    role: Role.ADMIN,
    department: "Human Resources",
    company: "Dayflow Technologies",
    location: "Bengaluru HQ",
    mustChangePassword: false,
    dateOfJoining: "2024-01-15",
    dob: "1988-06-14",
    gender: "Male",
    maritalStatus: "Married",
    address: "402, Skyline Residency, Indiranagar, Bengaluru, Karnataka - 560038",
    panNo: "ABCDE1234F",
    uanNo: "100234567890",
    expCode: "EXP-HR-001",
    bankName: "HDFC Bank",
    bankAccount: "987654321001",
    ifsc: "HDFC0001234",
    about: "Accomplished Human Resources leader with 12+ years of experience in workforce scaling, people analytics, and strategic culture building.",
    skills: ["Strategic HR", "Talent Acquisition", "Compensation & Benefits", "Compliance", "People Analytics"],
    certifications: ["SHRM-SCP", "OD Specialist", "Certified Compensation Professional"],
    hobbies: "Marathon running, Chess, Classical music, Reading biography classics.",
    monthlyWage: 250000,
  },
  {
    loginId: "OIMENA20260016",
    name: "Meera Nambiar",
    email: "meera.nambiar@dayflow.com",
    phone: "+91 98765 43211",
    role: Role.EMPLOYEE,
    department: "Human Resources",
    company: "Dayflow Technologies",
    location: "Bengaluru HQ",
    dateOfJoining: "2024-02-10",
    dob: "1993-04-18",
    gender: "Female",
    maritalStatus: "Single",
    address: "14, Green Glen Layout, Bellandur, Bengaluru - 560103",
    panNo: "MNBVC1234K",
    uanNo: "100234567816",
    expCode: "EXP-HR-016",
    bankName: "ICICI Bank",
    bankAccount: "501009876516",
    ifsc: "ICIC0000501",
    about: "Senior Talent Acquisition Partner specializing in leadership hiring, tech recruitment, and employee onboarding experiences.",
    skills: ["Technical Sourcing", "Executive Search", "Interviewing", "Offer Negotiation", "Employer Branding"],
    certifications: ["LinkedIn Certified Recruiter", "AIRS Certified"],
    hobbies: "Baking, Urban gardening, Swimming.",
    monthlyWage: 115000,
  },
  {
    loginId: "OIDENA20260017",
    name: "Deepak Nair",
    email: "deepak.nair@dayflow.com",
    phone: "+91 98765 43212",
    role: Role.EMPLOYEE,
    department: "Human Resources",
    company: "Dayflow Technologies",
    location: "Bengaluru HQ",
    dateOfJoining: "2024-03-20",
    dob: "1994-08-25",
    gender: "Male",
    maritalStatus: "Married",
    address: "703, Mantri Espana, Outer Ring Road, Bengaluru - 560103",
    panNo: "DPNAI2345M",
    uanNo: "100234567817",
    expCode: "EXP-HR-017",
    bankName: "Axis Bank",
    bankAccount: "912010045617",
    ifsc: "UTIB0000120",
    about: "People Operations specialist managing HR compliance, leave governance, internal workplace policies, and conflict resolution.",
    skills: ["HR Operations", "Statutory Compliance", "Employee Relations", "HRIS Management"],
    certifications: ["HRCI-PHR", "Labor Laws & Compliance Diploma"],
    hobbies: "Badminton, Photography, Table tennis.",
    monthlyWage: 95000,
  },
  {
    loginId: "OISHSA20260018",
    name: "Shruti Saxena",
    email: "shruti.saxena@dayflow.com",
    phone: "+91 98765 43213",
    role: Role.EMPLOYEE,
    department: "Human Resources",
    company: "Dayflow Technologies",
    location: "Mumbai Tech Park",
    dateOfJoining: "2024-04-05",
    dob: "1992-12-10",
    gender: "Female",
    maritalStatus: "Single",
    address: "A-502, Raheja Vihar, Powai, Mumbai - 400072",
    panNo: "SHSAX3456P",
    uanNo: "100234567818",
    expCode: "EXP-HR-018",
    bankName: "HDFC Bank",
    bankAccount: "501008765418",
    ifsc: "HDFC0000501",
    about: "Employee Relations & Culture Manager driving employee engagement, pulse surveys, wellbeing programs, and DEI initiatives.",
    skills: ["Culture Building", "Employee Engagement", "Conflict Resolution", "DEI Strategy"],
    certifications: ["Certified Engagement Professional", "Design Thinking in HR"],
    hobbies: "Yoga, Book club organizer, Travel blogging.",
    monthlyWage: 120000,
  },
  {
    loginId: "OIRAPI20260019",
    name: "Rajeshwari Pillai",
    email: "rajeshwari.pillai@dayflow.com",
    phone: "+91 98765 43214",
    role: Role.EMPLOYEE,
    department: "Human Resources",
    company: "Dayflow Technologies",
    location: "Bengaluru HQ",
    dateOfJoining: "2024-05-12",
    dob: "1991-03-30",
    gender: "Female",
    maritalStatus: "Married",
    address: "88, 4th Cross, Koramangala 4th Block, Bengaluru - 560034",
    panNo: "RPILA4567Q",
    uanNo: "100234567819",
    expCode: "EXP-HR-019",
    bankName: "State Bank of India",
    bankAccount: "309876543219",
    ifsc: "SBIN0001822",
    about: "Compensation & Benefits Specialist with deep expertise in salary benchmarking, incentive structures, PF, and tax planning.",
    skills: ["Total Rewards", "Payroll Administration", "Taxation Rules", "Benefits Design"],
    certifications: ["Certified Compensation Professional (CCP)", "Tax & Payroll Auditor"],
    hobbies: "Carnatic classical singing, Sudoku, Cooking.",
    monthlyWage: 105000,
  },
  {
    loginId: "OIAMKU20260020",
    name: "Amit Kulkarni",
    email: "amit.kulkarni@dayflow.com",
    phone: "+91 98765 43215",
    role: Role.EMPLOYEE,
    department: "Human Resources",
    company: "Dayflow Technologies",
    location: "Pune Office",
    dateOfJoining: "2024-06-01",
    dob: "1993-07-22",
    gender: "Male",
    maritalStatus: "Married",
    address: "C-301, Rohan Mithila, Viman Nagar, Pune - 411014",
    panNo: "AMKUL5678R",
    uanNo: "100234567820",
    expCode: "EXP-HR-020",
    bankName: "ICICI Bank",
    bankAccount: "501007654320",
    ifsc: "ICIC0000501",
    about: "Learning & Development Lead focused on continuous engineering skilling, management workshops, and career pathways.",
    skills: ["L&D Strategy", "Instructional Design", "Leadership Coaching", "E-Learning"],
    certifications: ["ATD Certified Professional in Talent Development", "Scrum Master"],
    hobbies: "Cricket, Cycling, Acoustic guitar.",
    monthlyWage: 110000,
  },

  // ==========================================
  // 2. ENGINEERING (7 Employees)
  // ==========================================
  {
    loginId: "OIAASH20260002",
    name: "Aarav Sharma",
    email: "aarav.sharma@dayflow.com",
    phone: "+91 98765 11111",
    role: Role.EMPLOYEE,
    department: "Engineering",
    company: "Dayflow Technologies",
    location: "Bengaluru HQ",
    mustChangePassword: false,
    dateOfJoining: "2024-03-01",
    dob: "1994-09-22",
    gender: "Male",
    maritalStatus: "Single",
    address: "12, Palm Meadows, Whitefield, Bengaluru, Karnataka - 560066",
    panNo: "FGHIJ5678K",
    uanNo: "100987654321",
    expCode: "EXP-ENG-042",
    bankName: "ICICI Bank",
    bankAccount: "501004567891",
    ifsc: "ICIC0000501",
    about: "Full Stack Engineer passionate about building scalable cloud applications, distributed microservices, and slick reactive web UI.",
    skills: ["TypeScript", "Next.js", "React", "PostgreSQL", "Prisma", "Docker", "AWS", "GraphQL"],
    certifications: ["AWS Certified Solutions Architect", "CKA - Certified Kubernetes Administrator", "Meta Front-End Specialization"],
    hobbies: "Open source contributing, badminton, photography, tech blogging.",
    monthlyWage: 150000,
  },
  {
    loginId: "OIVIMA20260005",
    name: "Vikram Malhotra",
    email: "vikram.malhotra@dayflow.com",
    phone: "+91 98765 11112",
    role: Role.EMPLOYEE,
    department: "Engineering",
    company: "Dayflow Technologies",
    location: "Bengaluru HQ",
    dateOfJoining: "2023-11-15",
    dob: "1990-05-14",
    gender: "Male",
    maritalStatus: "Married",
    address: "Villa 34, Prestige Golfshire, Nandi Hills, Bengaluru - 562110",
    panNo: "VKMAL1234A",
    uanNo: "100987654325",
    expCode: "EXP-ENG-005",
    bankName: "HDFC Bank",
    bankAccount: "501001234505",
    ifsc: "HDFC0000501",
    about: "Lead Cloud & DevOps Architect specializing in high-availability Kubernetes clusters, Terraform infrastructure as code, and zero-downtime CI/CD pipelines.",
    skills: ["Kubernetes", "Docker", "Terraform", "AWS", "GCP", "CI/CD", "Prometheus", "Kafka"],
    certifications: ["AWS DevOps Professional", "HashiCorp Certified Terraform Associate", "CKS - Kubernetes Security"],
    hobbies: "High-altitude trekking, Astronomy, Formula 1 sim racing.",
    monthlyWage: 180000,
  },
  {
    loginId: "OISNPA20260006",
    name: "Sneha Patel",
    email: "sneha.patel@dayflow.com",
    phone: "+91 98765 11113",
    role: Role.EMPLOYEE,
    department: "Engineering",
    company: "Dayflow Technologies",
    location: "Bengaluru HQ",
    dateOfJoining: "2024-02-01",
    dob: "1995-11-28",
    gender: "Female",
    maritalStatus: "Single",
    address: "B-204, Salarpuria Greenage, Hosur Road, Bengaluru - 560068",
    panNo: "SNPAT2345B",
    uanNo: "100987654326",
    expCode: "EXP-ENG-006",
    bankName: "Kotak Mahindra Bank",
    bankAccount: "601001234506",
    ifsc: "KKBK0000601",
    about: "Senior Frontend Engineer focused on responsive design architectures, web vitals optimization, accessible component libraries, and Next.js 14 App Router.",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Redux Toolkit", "Jest", "Playwright"],
    certifications: ["Meta Certified Frontend Developer", "Google Mobile Web Specialist"],
    hobbies: "Contemporary dance, Digital illustration, Coffee brewing.",
    monthlyWage: 135000,
  },
  {
    loginId: "OIANIY20260007",
    name: "Ananya Iyer",
    email: "ananya.iyer@dayflow.com",
    phone: "+91 98765 11114",
    role: Role.EMPLOYEE,
    department: "Engineering",
    company: "Dayflow Technologies",
    location: "Hyderabad Campus",
    dateOfJoining: "2024-01-10",
    dob: "1996-03-12",
    gender: "Female",
    maritalStatus: "Single",
    address: "Flat 1202, My Home Bhooja, HITEC City, Hyderabad - 500081",
    panNo: "ANIYE3456C",
    uanNo: "100987654327",
    expCode: "EXP-ENG-007",
    bankName: "HDFC Bank",
    bankAccount: "501001234507",
    ifsc: "HDFC0000501",
    about: "Backend Systems Engineer specialized in concurrent distributed architectures, Go/Node.js microservices, and database tuning.",
    skills: ["Node.js", "Go", "PostgreSQL", "Prisma", "Redis", "gRPC", "RabbitMQ"],
    certifications: ["MongoDB Certified Developer", "AWS Certified Developer Associate"],
    hobbies: "Violin, Sci-Fi novels, Chess.",
    monthlyWage: 140000,
  },
  {
    loginId: "OIRAVE20260008",
    name: "Rahul Verma",
    email: "rahul.verma@dayflow.com",
    phone: "+91 98765 11115",
    role: Role.EMPLOYEE,
    department: "Engineering",
    company: "Dayflow Technologies",
    location: "Delhi Hub",
    dateOfJoining: "2024-04-15",
    dob: "1995-07-19",
    gender: "Male",
    maritalStatus: "Single",
    address: "Plot 45, Sector 56, Gurugram, Haryana - 122011",
    panNo: "RAVER4567D",
    uanNo: "100987654328",
    expCode: "EXP-ENG-008",
    bankName: "Axis Bank",
    bankAccount: "912010045608",
    ifsc: "UTIB0000120",
    about: "Mobile App Developer creating high-performance cross-platform iOS & Android experiences with React Native, Expo, and native Swift/Kotlin modules.",
    skills: ["React Native", "Expo", "TypeScript", "Swift", "Kotlin", "State Management", "Firebase"],
    certifications: ["Meta Mobile Developer", "Google Associate Android Developer"],
    hobbies: "Football, Gaming, Drone videography.",
    monthlyWage: 125000,
  },
  {
    loginId: "OIKASI20260009",
    name: "Karan Singhania",
    email: "karan.singhania@dayflow.com",
    phone: "+91 98765 11116",
    role: Role.EMPLOYEE,
    department: "Engineering",
    company: "Dayflow Technologies",
    location: "Bengaluru HQ",
    dateOfJoining: "2024-05-02",
    dob: "1993-10-08",
    gender: "Male",
    maritalStatus: "Married",
    address: "Tower 4, Sobha Dream Acres, Panathur, Bengaluru - 560087",
    panNo: "KASIN5678E",
    uanNo: "100987654329",
    expCode: "EXP-ENG-009",
    bankName: "ICICI Bank",
    bankAccount: "501001234509",
    ifsc: "ICIC0000501",
    about: "QA Automation & Security Lead building robust end-to-end test suites, load testing frameworks, and vulnerability scanners.",
    skills: ["Playwright", "Cypress", "Selenium", "Postman", "k6", "OWASP Security", "TypeScript"],
    certifications: ["ISTQB Advanced Test Automation", "Certified Ethical Hacker (CEH)"],
    hobbies: "Squash, Mechanical keyboard building, Podcasting.",
    monthlyWage: 115000,
  },
  {
    loginId: "OITADE20260010",
    name: "Tanvi Deshmukh",
    email: "tanvi.deshmukh@dayflow.com",
    phone: "+91 98765 11117",
    role: Role.EMPLOYEE,
    department: "Engineering",
    company: "Dayflow Technologies",
    location: "Pune Office",
    dateOfJoining: "2024-06-15",
    dob: "1994-01-30",
    gender: "Female",
    maritalStatus: "Single",
    address: "501, Amanora Park Town, Hadapsar, Pune - 411028",
    panNo: "TADES6789F",
    uanNo: "100987654330",
    expCode: "EXP-ENG-010",
    bankName: "State Bank of India",
    bankAccount: "309876543210",
    ifsc: "SBIN0001822",
    about: "Data Platform & Analytics Engineer designing real-time streaming ETL pipelines, schema transformations, and warehouse data marts.",
    skills: ["Python", "Apache Spark", "SQL", "BigQuery", "dbt", "Airflow", "FastAPI"],
    certifications: ["Google Cloud Professional Data Engineer", "Databricks Spark Developer"],
    hobbies: "Baking pastries, Bird watching, Painting.",
    monthlyWage: 130000,
  },

  // ==========================================
  // 3. PRODUCT DESIGN (6 Employees)
  // ==========================================
  {
    loginId: "OIROGU20260003",
    name: "Rohan Gupta",
    email: "rohan.gupta@dayflow.com",
    phone: "+91 98765 22222",
    role: Role.EMPLOYEE,
    department: "Product Design",
    company: "Dayflow Technologies",
    location: "Mumbai Tech Park",
    mustChangePassword: true,
    dateOfJoining: "2024-06-10",
    dob: "1992-11-05",
    gender: "Male",
    maritalStatus: "Married",
    address: "Flat 801, Sea View Towers, Bandra West, Mumbai, Maharashtra - 400050",
    panNo: "KLMNO9012P",
    uanNo: "100554433221",
    expCode: "EXP-DES-018",
    bankName: "State Bank of India",
    bankAccount: "309876543211",
    ifsc: "SBIN0001822",
    about: "Product Designer obsessed with crafting cohesive design systems, micro-interactions, and accessible web experiences for SaaS platforms.",
    skills: ["Figma", "Design Systems", "User Research", "Wireframing", "Prototyping", "Tailwind CSS"],
    certifications: ["Nielsen Norman UX Master", "Interaction Design Foundation Specialist"],
    hobbies: "Architectural sketching, espresso brewing, cycling, typography history.",
    monthlyWage: 130000,
  },
  {
    loginId: "OINASE20260011",
    name: "Natasha Sen",
    email: "natasha.sen@dayflow.com",
    phone: "+91 98765 22223",
    role: Role.EMPLOYEE,
    department: "Product Design",
    company: "Dayflow Technologies",
    location: "Bengaluru HQ",
    dateOfJoining: "2024-02-15",
    dob: "1993-08-14",
    gender: "Female",
    maritalStatus: "Single",
    address: "202, Indiranagar 100ft Road, Bengaluru - 560038",
    panNo: "NASEN1234G",
    uanNo: "100554433211",
    expCode: "EXP-DES-011",
    bankName: "HDFC Bank",
    bankAccount: "501001234511",
    ifsc: "HDFC0000501",
    about: "Senior Product Designer shaping enterprise SaaS user journeys, information architecture, and multi-tenant admin dashboards.",
    skills: ["UX Design", "Information Architecture", "Figma", "User Journey Mapping", "Design Thinking"],
    certifications: ["Google UX Design Professional Certificate"],
    hobbies: "Pottery, Travel photography, Modern art museums.",
    monthlyWage: 125000,
  },
  {
    loginId: "OIKAME20260012",
    name: "Kabir Mehta",
    email: "kabir.mehta@dayflow.com",
    phone: "+91 98765 22224",
    role: Role.EMPLOYEE,
    department: "Product Design",
    company: "Dayflow Technologies",
    location: "Delhi Hub",
    dateOfJoining: "2024-03-10",
    dob: "1995-02-20",
    gender: "Male",
    maritalStatus: "Single",
    address: "B-12, Hauz Khas Enclave, New Delhi - 110016",
    panNo: "KAMEH2345H",
    uanNo: "100554433212",
    expCode: "EXP-DES-012",
    bankName: "ICICI Bank",
    bankAccount: "501001234512",
    ifsc: "ICIC0000501",
    about: "Design Systems & Interaction Specialist maintaining component tokens, accessibility guidelines (WCAG 2.1 AAA), and Framer animations.",
    skills: ["Design Tokens", "Figma Variables", "Component Libraries", "WCAG Accessibility", "Framer Motion"],
    certifications: ["Certified Interaction Designer (IxDF)"],
    hobbies: "Electronic music production, Vinyl collecting, Film critique.",
    monthlyWage: 110000,
  },
  {
    loginId: "OIPORE20260013",
    name: "Pooja Reddy",
    email: "pooja.reddy@dayflow.com",
    phone: "+91 98765 22225",
    role: Role.EMPLOYEE,
    department: "Product Design",
    company: "Dayflow Technologies",
    location: "Hyderabad Campus",
    dateOfJoining: "2024-04-18",
    dob: "1996-06-11",
    gender: "Female",
    maritalStatus: "Single",
    address: "Road No 45, Jubilee Hills, Hyderabad - 500033",
    panNo: "PORED3456I",
    uanNo: "100554433213",
    expCode: "EXP-DES-013",
    bankName: "Axis Bank",
    bankAccount: "912010045613",
    ifsc: "UTIB0000120",
    about: "Visual Identity & Brand Designer creating evocative brand illustrations, marketing graphics, and landing page visual aesthetics.",
    skills: ["Illustration", "Brand Strategy", "Adobe Creative Suite", "3D Blender", "Typography"],
    certifications: ["Adobe Certified Professional in Visual Design"],
    hobbies: "Watercolor painting, Scuba diving, Botanical gardening.",
    monthlyWage: 95000,
  },
  {
    loginId: "OIADJO20260014",
    name: "Aditya Joshi",
    email: "aditya.joshi@dayflow.com",
    phone: "+91 98765 22226",
    role: Role.EMPLOYEE,
    department: "Product Design",
    company: "Dayflow Technologies",
    location: "Pune Office",
    dateOfJoining: "2024-05-15",
    dob: "1991-09-04",
    gender: "Male",
    maritalStatus: "Married",
    address: "Flat 402, Clover Highlands, NIBM Road, Pune - 411048",
    panNo: "ADJOS4567J",
    uanNo: "100554433214",
    expCode: "EXP-DES-014",
    bankName: "Kotak Mahindra Bank",
    bankAccount: "601001234514",
    ifsc: "KKBK0000601",
    about: "UX Researcher conducting qualitative usability tests, persona interviews, and ethnographic workforce workflow analysis.",
    skills: ["User Interviews", "Usability Testing", "Card Sorting", "Persona Creation", "Quantitative Surveys"],
    certifications: ["UXQB Certified Professional for Usability & User Experience (CPUX-F)"],
    hobbies: "Historical documentaries, Table tennis, Marathon training.",
    monthlyWage: 115000,
  },
  {
    loginId: "OISIKA20260015",
    name: "Simran Kaur",
    email: "simran.kaur@dayflow.com",
    phone: "+91 98765 22227",
    role: Role.EMPLOYEE,
    department: "Product Design",
    company: "Dayflow Technologies",
    location: "Delhi Hub",
    dateOfJoining: "2024-06-25",
    dob: "1995-12-03",
    gender: "Female",
    maritalStatus: "Single",
    address: "C-14, Model Town 2, New Delhi - 110009",
    panNo: "SIKAU5678K",
    uanNo: "100554433215",
    expCode: "EXP-DES-015",
    bankName: "HDFC Bank",
    bankAccount: "501001234515",
    ifsc: "HDFC0000501",
    about: "Interactive Motion & Prototyping Specialist building realistic high-fidelity micro-interactions and prototype simulations.",
    skills: ["Protopie", "Framer", "Lottie Animations", "Micro-interactions", "Figma"],
    certifications: ["Motion Design Specialist (School of Motion)"],
    hobbies: "Baking bread, Indie board games, Roller skating.",
    monthlyWage: 100000,
  },

  // ==========================================
  // 4. MARKETING (6 Employees)
  // ==========================================
  {
    loginId: "OIPRSH20260004",
    name: "Priya Sharma",
    email: "priya.sharma@dayflow.com",
    phone: "+91 98765 33333",
    role: Role.EMPLOYEE,
    department: "Marketing",
    company: "Dayflow Technologies",
    location: "Delhi Hub",
    mustChangePassword: false,
    dateOfJoining: "2024-04-18",
    dob: "1995-02-18",
    gender: "Female",
    maritalStatus: "Single",
    address: "B-44, Greater Kailash 1, New Delhi, Delhi - 110048",
    panNo: "PQRST3456U",
    uanNo: "100778899001",
    expCode: "EXP-MKT-009",
    bankName: "Axis Bank",
    bankAccount: "002201567890",
    ifsc: "UTIB0000022",
    about: "Growth Marketing specialist driving SaaS product adoption, SEO architecture, developer community evangelism, and demand gen.",
    skills: ["Growth Marketing", "B2B SaaS Strategy", "Content Strategy", "SEO", "HubSpot", "Google Analytics"],
    certifications: ["Google Analytics 4 Certified", "HubSpot Inbound Marketing Master"],
    hobbies: "Podcasting, badminton, creative writing, gourmet cooking.",
    monthlyWage: 110000,
  },
  {
    loginId: "OIARKA20260021",
    name: "Arjun Kapoor",
    email: "arjun.kapoor@dayflow.com",
    phone: "+91 98765 33334",
    role: Role.EMPLOYEE,
    department: "Marketing",
    company: "Dayflow Technologies",
    location: "Bengaluru HQ",
    dateOfJoining: "2024-03-01",
    dob: "1992-05-19",
    gender: "Male",
    maritalStatus: "Married",
    address: "56, 12th Main, HAL 2nd Stage, Indiranagar, Bengaluru - 560008",
    panNo: "ARKAP1234L",
    uanNo: "100778899021",
    expCode: "EXP-MKT-021",
    bankName: "HDFC Bank",
    bankAccount: "501001234521",
    ifsc: "HDFC0000501",
    about: "Content Strategy & Technical SEO Lead creating in-depth industry benchmark whitepapers, developer tutorials, and viral technical articles.",
    skills: ["Technical Writing", "SEO Architecture", "Content Marketing", "Ahrefs", "Semrush"],
    certifications: ["HubSpot Content Marketing Certified", "Semrush SEO Toolkit Expert"],
    hobbies: "Stand-up comedy, Mountain biking, Podcasting.",
    monthlyWage: 95000,
  },
  {
    loginId: "OIDIME20260022",
    name: "Divya Menon",
    email: "divya.menon@dayflow.com",
    phone: "+91 98765 33335",
    role: Role.EMPLOYEE,
    department: "Marketing",
    company: "Dayflow Technologies",
    location: "Bengaluru HQ",
    dateOfJoining: "2023-12-01",
    dob: "1991-10-14",
    gender: "Female",
    maritalStatus: "Married",
    address: "Villa 108, Adarsh Palm Retreat, Outer Ring Road, Bengaluru - 560103",
    panNo: "DIMEN2345M",
    uanNo: "100778899022",
    expCode: "EXP-MKT-022",
    bankName: "ICICI Bank",
    bankAccount: "501001234522",
    ifsc: "ICIC0000501",
    about: "Product Marketing Manager orchestrating high-impact feature launches, competitive positioning matrices, and sales enablement decks.",
    skills: ["Product Marketing", "Go-to-Market Strategy", "Competitive Intelligence", "Value Proposition"],
    certifications: ["Product Marketing Alliance (PMA) Core Certified"],
    hobbies: "Kathak dance, Filter coffee brewing, French cinema.",
    monthlyWage: 125000,
  },
  {
    loginId: "OIKUBH20260023",
    name: "Kunal Bhatia",
    email: "kunal.bhatia@dayflow.com",
    phone: "+91 98765 33336",
    role: Role.EMPLOYEE,
    department: "Marketing",
    company: "Dayflow Technologies",
    location: "Mumbai Tech Park",
    dateOfJoining: "2024-04-01",
    dob: "1994-06-27",
    gender: "Male",
    maritalStatus: "Single",
    address: "Flat 1403, Lodha Park, Worli, Mumbai - 400018",
    panNo: "KUBHA3456N",
    uanNo: "100778899023",
    expCode: "EXP-MKT-023",
    bankName: "Kotak Mahindra Bank",
    bankAccount: "601001234523",
    ifsc: "KKBK0000601",
    about: "Performance & Paid Acquisition Specialist scaling multi-channel paid ads across Google Search, LinkedIn Ads, and Meta Business.",
    skills: ["Google Ads", "LinkedIn Campaign Manager", "Conversion Rate Optimization (CRO)", "Attribution Modeling"],
    certifications: ["Google Ads Search & Display Certified", "Meta Certified Media Buying Professional"],
    hobbies: "Stock market trading, Tennis, Scuba diving.",
    monthlyWage: 105000,
  },
  {
    loginId: "OIRIBA20260024",
    name: "Riya Bansal",
    email: "riya.bansal@dayflow.com",
    phone: "+91 98765 33337",
    role: Role.EMPLOYEE,
    department: "Marketing",
    company: "Dayflow Technologies",
    location: "Delhi Hub",
    dateOfJoining: "2024-05-10",
    dob: "1997-01-15",
    gender: "Female",
    maritalStatus: "Single",
    address: "H-22, Saket, New Delhi - 110017",
    panNo: "RIBAN4567O",
    uanNo: "100778899024",
    expCode: "EXP-MKT-024",
    bankName: "State Bank of India",
    bankAccount: "309876543224",
    ifsc: "SBIN0001822",
    about: "Community & Social Media Lead fostering engaged developer communities on Discord, Twitter/X, and LinkedIn through interactive campaigns.",
    skills: ["Community Management", "Social Media Marketing", "Copywriting", "Discord Moderation", "Canva"],
    certifications: ["Hootsuite Social Marketing Specialist"],
    hobbies: "Poetry writing, Cat fostering, Board games.",
    monthlyWage: 85000,
  },
  {
    loginId: "OIVADH20260025",
    name: "Varun Dhawan",
    email: "varun.dhawan@dayflow.com",
    phone: "+91 98765 33338",
    role: Role.EMPLOYEE,
    department: "Marketing",
    company: "Dayflow Technologies",
    location: "Mumbai Tech Park",
    dateOfJoining: "2024-06-01",
    dob: "1993-04-24",
    gender: "Male",
    maritalStatus: "Single",
    address: "702, Oberoi Sky Heights, Lokhandwala, Andheri West, Mumbai - 400053",
    panNo: "VADHA5678P",
    uanNo: "100778899025",
    expCode: "EXP-MKT-025",
    bankName: "HDFC Bank",
    bankAccount: "501001234525",
    ifsc: "HDFC0000501",
    about: "Brand Events & PR Strategist planning hackathons, product keynotes, tech conferences, and media press relations.",
    skills: ["Event Management", "Public Relations", "Brand Activations", "Sponsorship Negotiations"],
    certifications: ["CMP - Certified Meeting Professional"],
    hobbies: "Baking sourdough, Calisthenics, Road trips.",
    monthlyWage: 90000,
  },

  // ==========================================
  // 5. SALES (6 Employees)
  // ==========================================
  {
    loginId: "OISIRA20260026",
    name: "Siddharth Rao",
    email: "siddharth.rao@dayflow.com",
    phone: "+91 98765 55551",
    role: Role.EMPLOYEE,
    department: "Sales",
    company: "Dayflow Technologies",
    location: "Bengaluru HQ",
    dateOfJoining: "2023-10-01",
    dob: "1989-08-15",
    gender: "Male",
    maritalStatus: "Married",
    address: "Penthouse 18, Phoenix One Bangalore West, Rajajinagar, Bengaluru - 560010",
    panNo: "SIRAO1234Q",
    uanNo: "100445566026",
    expCode: "EXP-SAL-026",
    bankName: "HDFC Bank",
    bankAccount: "501001234526",
    ifsc: "HDFC0000501",
    about: "Enterprise Account Director closing multi-crore SaaS deals, leading enterprise RFP negotiations, and managing C-suite client relationships.",
    skills: ["Enterprise Sales", "MEDDPICC", "Contract Negotiation", "Executive Relationship Building", "Salesforce"],
    certifications: ["Miller Heiman Strategic Selling Certified", "Sandler Sales Foundation"],
    hobbies: "Golf, Single malt tasting, Horology.",
    monthlyWage: 160000,
  },
  {
    loginId: "OINECH20260027",
    name: "Neha Choudhary",
    email: "neha.choudhary@dayflow.com",
    phone: "+91 98765 55552",
    role: Role.EMPLOYEE,
    department: "Sales",
    company: "Dayflow Technologies",
    location: "Mumbai Tech Park",
    dateOfJoining: "2024-01-15",
    dob: "1992-03-21",
    gender: "Female",
    maritalStatus: "Single",
    address: "Flat 1204, Hiranandani Gardens, Powai, Mumbai - 400076",
    panNo: "NECHO2345R",
    uanNo: "100445566027",
    expCode: "EXP-SAL-027",
    bankName: "ICICI Bank",
    bankAccount: "501001234527",
    ifsc: "ICIC0000501",
    about: "Regional B2B Sales Manager driving rapid mid-market territory expansion across Western and Northern India enterprise sectors.",
    skills: ["B2B SaaS Sales", "Pipeline Management", "Sales Team Coaching", "HubSpot CRM"],
    certifications: ["Certified Professional Sales Leader (NASP)"],
    hobbies: "Pilates, Travel journaling, Reading geopolitical thrillers.",
    monthlyWage: 140000,
  },
  {
    loginId: "OIAMVE20260028",
    name: "Aman Verma",
    email: "aman.verma@dayflow.com",
    phone: "+91 98765 55553",
    role: Role.EMPLOYEE,
    department: "Sales",
    company: "Dayflow Technologies",
    location: "Delhi Hub",
    dateOfJoining: "2024-03-01",
    dob: "1995-11-09",
    gender: "Male",
    maritalStatus: "Single",
    address: "Tower 2, DLF Phase 5, Gurugram, Haryana - 122009",
    panNo: "AMVER3456S",
    uanNo: "100445566028",
    expCode: "EXP-SAL-028",
    bankName: "Axis Bank",
    bankAccount: "912010045628",
    ifsc: "UTIB0000120",
    about: "Inbound Sales Lead conducting deep product demonstrations, technical discovery sessions, and solution architecture pitches.",
    skills: ["Product Demos", "Inbound Qualification", "Solution Selling", "Objection Handling"],
    certifications: ["Command of the Message Certified", "Salesforce Administrator"],
    hobbies: "Badminton, Mechanical watches, Gaming.",
    monthlyWage: 100000,
  },
  {
    loginId: "OIKRSA20260029",
    name: "Kriti Sanon",
    email: "kriti.sanon@dayflow.com",
    phone: "+91 98765 55554",
    role: Role.EMPLOYEE,
    department: "Sales",
    company: "Dayflow Technologies",
    location: "Bengaluru HQ",
    dateOfJoining: "2024-04-10",
    dob: "1994-07-26",
    gender: "Female",
    maritalStatus: "Single",
    address: "303, Embassy Pristine, Bellandur, Bengaluru - 560103",
    panNo: "KRSAN4567T",
    uanNo: "100445566029",
    expCode: "EXP-SAL-029",
    bankName: "HDFC Bank",
    bankAccount: "501001234529",
    ifsc: "HDFC0000501",
    about: "Customer Success & Retention Lead ensuring smooth client onboarding, adoption metrics, quarterly business reviews (QBRs), and renewals.",
    skills: ["Customer Success", "Retention Strategy", "Account Health Scoring", "Churn Reduction", "Zendesk"],
    certifications: ["Gainsight Certified Customer Success Manager"],
    hobbies: "Kathak, Sketching, Baking sourdough breads.",
    monthlyWage: 110000,
  },
  {
    loginId: "OIJAVA20260030",
    name: "Harsh Vardhan",
    email: "harsh.vardhan@dayflow.com",
    phone: "+91 98765 55555",
    role: Role.EMPLOYEE,
    department: "Sales",
    company: "Dayflow Technologies",
    location: "Hyderabad Campus",
    dateOfJoining: "2024-05-15",
    dob: "1996-02-14",
    gender: "Male",
    maritalStatus: "Single",
    address: "Plot 89, Madhapur, Hyderabad - 500081",
    panNo: "HAVAR5678U",
    uanNo: "100445566030",
    expCode: "EXP-SAL-030",
    bankName: "Kotak Mahindra Bank",
    bankAccount: "601001234530",
    ifsc: "KKBK0000601",
    about: "Business Development Representative prospecting high-potential enterprise leads, outbound email sequences, and cold outreach campaigns.",
    skills: ["Outbound Prospecting", "Apollo.io", "Cold Outreach", "Lead Qualification", "LinkedIn Sales Navigator"],
    certifications: ["HubSpot Sales Software Certified"],
    hobbies: "Weightlifting, Chess, Cooking Mughlai cuisine.",
    monthlyWage: 80000,
  },
  {
    loginId: "OIRAAP20260031",
    name: "Radhika Apte",
    email: "radhika.apte@dayflow.com",
    phone: "+91 98765 55556",
    role: Role.EMPLOYEE,
    department: "Sales",
    company: "Dayflow Technologies",
    location: "Pune Office",
    dateOfJoining: "2024-06-01",
    dob: "1993-09-07",
    gender: "Female",
    maritalStatus: "Married",
    address: "Row House 7, Nyati Estate, Mohammed Wadi, Pune - 411060",
    panNo: "RAAPT6789V",
    uanNo: "100445566031",
    expCode: "EXP-SAL-031",
    bankName: "State Bank of India",
    bankAccount: "309876543231",
    ifsc: "SBIN0001822",
    about: "Strategic Partnerships Manager developing co-selling channels, alliance ecosystems with technology integrators, and consultant relationships.",
    skills: ["Channel Partnerships", "Co-selling Strategy", "Alliance Management", "Partner Enablement"],
    certifications: ["Association of Strategic Alliance Professionals (CA-AM)"],
    hobbies: "Classical theatre, Hiking, Gardening.",
    monthlyWage: 120000,
  },

  // ==========================================
  // 6. OPERATIONS (6 Employees)
  // ==========================================
  {
    loginId: "OIALMI20260032",
    name: "Alok Mishra",
    email: "alok.mishra@dayflow.com",
    phone: "+91 98765 66661",
    role: Role.EMPLOYEE,
    department: "Operations",
    company: "Dayflow Technologies",
    location: "Bengaluru HQ",
    dateOfJoining: "2023-09-01",
    dob: "1987-12-04",
    gender: "Male",
    maritalStatus: "Married",
    address: "House 204, Brigade Gateway, Malleshwaram, Bengaluru - 560055",
    panNo: "ALMIS1234W",
    uanNo: "100332211032",
    expCode: "EXP-OPS-032",
    bankName: "HDFC Bank",
    bankAccount: "501001234532",
    ifsc: "HDFC0000501",
    about: "Head of Business Operations overseeing cross-functional scaling, SLA governance, enterprise business continuity, and operational efficiency.",
    skills: ["Business Operations", "Six Sigma Process Optimization", "Vendor Management", "Risk Assessment"],
    certifications: ["Lean Six Sigma Black Belt", "PMP - Project Management Professional"],
    hobbies: "Marathon cycling, Cricket coaching, Antique collecting.",
    monthlyWage: 175000,
  },
  {
    loginId: "OISWJA20260033",
    name: "Swati Jain",
    email: "swati.jain@dayflow.com",
    phone: "+91 98765 66662",
    role: Role.EMPLOYEE,
    department: "Operations",
    company: "Dayflow Technologies",
    location: "Bengaluru HQ",
    dateOfJoining: "2024-02-15",
    dob: "1992-06-18",
    gender: "Female",
    maritalStatus: "Single",
    address: "Flat 502, Purva Rivera, Marathahalli, Bengaluru - 560037",
    panNo: "SWJAI2345X",
    uanNo: "100332211033",
    expCode: "EXP-OPS-033",
    bankName: "ICICI Bank",
    bankAccount: "501001234533",
    ifsc: "ICIC0000501",
    about: "IT Infrastructure & Security Operations Lead managing enterprise access management, hardware provisioning, and SOC2 compliance.",
    skills: ["IT Operations", "Identity Management (Okta)", "Asset Management", "SOC2 Compliance", "Network Security"],
    certifications: ["ITIL 4 Managing Professional", "CompTIA Security+"],
    hobbies: "Baking cakes, Table tennis, Anime sketching.",
    monthlyWage: 130000,
  },
  {
    loginId: "OIGASE20260034",
    name: "Gaurav Sethi",
    email: "gaurav.sethi@dayflow.com",
    phone: "+91 98765 66663",
    role: Role.EMPLOYEE,
    department: "Operations",
    company: "Dayflow Technologies",
    location: "Delhi Hub",
    dateOfJoining: "2024-03-20",
    dob: "1994-04-12",
    gender: "Male",
    maritalStatus: "Married",
    address: "Block C, Sushant Lok 1, Gurugram, Haryana - 122002",
    panNo: "GASET3456Y",
    uanNo: "100332211034",
    expCode: "EXP-OPS-034",
    bankName: "Axis Bank",
    bankAccount: "912010045634",
    ifsc: "UTIB0000120",
    about: "Procurement & Vendor Manager streamlining SaaS software licenses, hardware agreements, and service provider contract negotiations.",
    skills: ["Vendor Negotiation", "Strategic Sourcing", "Contract Lifecycle Management", "Cost Reduction"],
    certifications: ["Certified Professional in Supply Management (CPSM)"],
    hobbies: "Motorcycle touring, Photography, Barista crafting.",
    monthlyWage: 105000,
  },
  {
    loginId: "OIPRAG20260035",
    name: "Preeti Agarwal",
    email: "preeti.agarwal@dayflow.com",
    phone: "+91 98765 66664",
    role: Role.EMPLOYEE,
    department: "Operations",
    company: "Dayflow Technologies",
    location: "Mumbai Tech Park",
    dateOfJoining: "2024-04-05",
    dob: "1993-01-29",
    gender: "Female",
    maritalStatus: "Single",
    address: "B-804, Kanakia Paris, BKC, Bandra East, Mumbai - 400051",
    panNo: "PRAGA4567Z",
    uanNo: "100332211035",
    expCode: "EXP-OPS-035",
    bankName: "HDFC Bank",
    bankAccount: "501001234535",
    ifsc: "HDFC0000501",
    about: "Compliance & Legal Operations Officer reviewing non-disclosure agreements, data privacy regulations (GDPR/DPDP), and corporate policies.",
    skills: ["Legal Operations", "Data Privacy (DPDP/GDPR)", "Corporate Governance", "Contract Review"],
    certifications: ["CIPP/E - Certified Information Privacy Professional"],
    hobbies: "Violin, Classical literature, Wildlife safari.",
    monthlyWage: 120000,
  },
  {
    loginId: "OIMATI20260036",
    name: "Manish Tiwari",
    email: "manish.tiwari@dayflow.com",
    phone: "+91 98765 66665",
    role: Role.EMPLOYEE,
    department: "Operations",
    company: "Dayflow Technologies",
    location: "Bengaluru HQ",
    dateOfJoining: "2024-05-01",
    dob: "1995-09-17",
    gender: "Male",
    maritalStatus: "Single",
    address: "Flat 203, Salarpuria Symphony, Electronic City Phase 1, Bengaluru - 560100",
    panNo: "MATIW5678A",
    uanNo: "100332211036",
    expCode: "EXP-OPS-036",
    bankName: "State Bank of India",
    bankAccount: "309876543236",
    ifsc: "SBIN0001822",
    about: "Facilities & Workplace Experience Lead ensuring ergonomic physical workspace, emergency safety compliance, and hybrid desk allocations.",
    skills: ["Workplace Operations", "Facility Management", "EHS Safety Compliance", "Real Estate Planning"],
    certifications: ["IFMA Facility Management Professional (FMP)"],
    hobbies: "Badminton, DIY woodcraft, Hydroponics.",
    monthlyWage: 85000,
  },
  {
    loginId: "OIBARA20260037",
    name: "Bhavna Rawat",
    email: "bhavna.rawat@dayflow.com",
    phone: "+91 98765 66666",
    role: Role.EMPLOYEE,
    department: "Operations",
    company: "Dayflow Technologies",
    location: "Hyderabad Campus",
    dateOfJoining: "2024-06-15",
    dob: "1996-08-08",
    gender: "Female",
    maritalStatus: "Single",
    address: "102, Fortune Enclave, Banjara Hills, Hyderabad - 500034",
    panNo: "BARAW6789B",
    uanNo: "100332211037",
    expCode: "EXP-OPS-037",
    bankName: "Kotak Mahindra Bank",
    bankAccount: "601001234537",
    ifsc: "KKBK0000601",
    about: "Logistics & Supply Chain Coordinator overseeing employee welcome kits, international courier dispatch, and IT asset retrieval.",
    skills: ["Supply Chain Coordination", "Inventory Management", "ERP Software", "Logistics Tracking"],
    certifications: ["CSCP - Certified Supply Chain Professional"],
    hobbies: "Kathakali dance, Sitar, Baking pastries.",
    monthlyWage: 80000,
  },

  // ==========================================
  // 7. FINANCE (6 Employees)
  // ==========================================
  {
    loginId: "OISASI20260038",
    name: "Sanjay Singhal",
    email: "sanjay.singhal@dayflow.com",
    phone: "+91 98765 77771",
    role: Role.EMPLOYEE,
    department: "Finance",
    company: "Dayflow Technologies",
    location: "Bengaluru HQ",
    dateOfJoining: "2023-08-01",
    dob: "1985-05-16",
    gender: "Male",
    maritalStatus: "Married",
    address: "Villa 22, Windmills of Your Mind, Whitefield, Bengaluru - 560066",
    panNo: "SASIN1234C",
    uanNo: "100112233038",
    expCode: "EXP-FIN-038",
    bankName: "HDFC Bank",
    bankAccount: "501001234538",
    ifsc: "HDFC0000501",
    about: "Chief Financial Officer & Finance Controller managing global cash flows, investor reporting, multi-currency treasury, and statutory audit compliance.",
    skills: ["Financial Planning & Analysis (FP&A)", "Corporate Finance", "Tax Planning", "M&A Diligence", "ERP Management"],
    certifications: ["Chartered Accountant (ICAI)", "CFA Charterholder"],
    hobbies: "Golf, Financial history books, Classical Hindustani music.",
    monthlyWage: 220000,
  },
  {
    loginId: "OIMORA20260039",
    name: "Monika Rao",
    email: "monika.rao@dayflow.com",
    phone: "+91 98765 77772",
    role: Role.EMPLOYEE,
    department: "Finance",
    company: "Dayflow Technologies",
    location: "Mumbai Tech Park",
    dateOfJoining: "2024-01-10",
    dob: "1992-10-23",
    gender: "Female",
    maritalStatus: "Married",
    address: "Flat 1102, RNA Mirage, Worli, Mumbai - 400018",
    panNo: "MORAO2345D",
    uanNo: "100112233039",
    expCode: "EXP-FIN-039",
    bankName: "ICICI Bank",
    bankAccount: "501001234539",
    ifsc: "ICIC0000501",
    about: "Senior Financial Analyst building financial forecasting models, SaaS unit economics metrics (LTV/CAC, ARR, NDR), and departmental burn budgets.",
    skills: ["Financial Modeling", "SaaS Metrics", "Budget Forecasting", "Excel Power Query", "PowerBI"],
    certifications: ["FMVA - Financial Modeling & Valuation Analyst"],
    hobbies: "Marathon running, Chess, Gourmet cooking.",
    monthlyWage: 125000,
  },
  {
    loginId: "OITAKH20260040",
    name: "Tarun Khurana",
    email: "tarun.khurana@dayflow.com",
    phone: "+91 98765 77773",
    role: Role.EMPLOYEE,
    department: "Finance",
    company: "Dayflow Technologies",
    location: "Delhi Hub",
    dateOfJoining: "2024-02-20",
    dob: "1991-07-11",
    gender: "Male",
    maritalStatus: "Married",
    address: "Tower 1, DLF Crest, Sector 54, Gurugram - 122002",
    panNo: "TAKHU3456E",
    uanNo: "100112233040",
    expCode: "EXP-FIN-040",
    bankName: "Axis Bank",
    bankAccount: "912010045640",
    ifsc: "UTIB0000120",
    about: "Taxation & Audit Specialist overseeing GST reconciliations, corporate income tax filings, advance tax computations, and internal controls.",
    skills: ["Direct & Indirect Tax", "GST Compliance", "Internal Audit", "Transfer Pricing"],
    certifications: ["Chartered Accountant (ICAI)", "DISA (ICAI)"],
    hobbies: "Badminton, Photography, Flute.",
    monthlyWage: 115000,
  },
  {
    loginId: "OISUAG20260041",
    name: "Sunita Agarwal",
    email: "sunita.agarwal@dayflow.com",
    phone: "+91 98765 77774",
    role: Role.EMPLOYEE,
    department: "Finance",
    company: "Dayflow Technologies",
    location: "Bengaluru HQ",
    dateOfJoining: "2024-03-15",
    dob: "1994-03-05",
    gender: "Female",
    maritalStatus: "Single",
    address: "Flat 401, SNN Raj Serenity, Begur, Bengaluru - 560068",
    panNo: "SUAGA4567F",
    uanNo: "100112233041",
    expCode: "EXP-FIN-041",
    bankName: "HDFC Bank",
    bankAccount: "501001234541",
    ifsc: "HDFC0000501",
    about: "Accounts Payable & General Ledger Lead handling vendor invoicing, expense approvals, payment runs, and bank reconciliations.",
    skills: ["Accounts Payable", "General Ledger", "Tally Prime", "Zoho Books", "Bank Reconciliation"],
    certifications: ["QuickBooks Certified ProAdvisor"],
    hobbies: "Sitar, Painting, Yoga.",
    monthlyWage: 95000,
  },
  {
    loginId: "OIRAJH20260042",
    name: "Rakesh Jhunjhunwala",
    email: "rakesh.jhunjhunwala@dayflow.com",
    phone: "+91 98765 77775",
    role: Role.EMPLOYEE,
    department: "Finance",
    company: "Dayflow Technologies",
    location: "Mumbai Tech Park",
    dateOfJoining: "2024-04-01",
    dob: "1990-11-20",
    gender: "Male",
    maritalStatus: "Married",
    address: "2201, Vivarea Towers, Mahalaxmi, Mumbai - 400011",
    panNo: "RAJHU5678G",
    uanNo: "100112233042",
    expCode: "EXP-FIN-042",
    bankName: "Kotak Mahindra Bank",
    bankAccount: "601001234542",
    ifsc: "KKBK0000601",
    about: "Treasury & Investment Analyst managing corporate liquidity, foreign exchange currency hedging, and overnight repo investments.",
    skills: ["Treasury Operations", "FX Hedging", "Cash Management", "Fixed Income Markets"],
    certifications: ["Certified Treasury Professional (CTP)"],
    hobbies: "Stock market research, Squash, Numismatics.",
    monthlyWage: 150000,
  },
  {
    loginId: "OIPAMI20260043",
    name: "Payal Mittal",
    email: "payal.mittal@dayflow.com",
    phone: "+91 98765 77776",
    role: Role.EMPLOYEE,
    department: "Finance",
    company: "Dayflow Technologies",
    location: "Delhi Hub",
    dateOfJoining: "2024-05-10",
    dob: "1997-09-14",
    gender: "Female",
    maritalStatus: "Single",
    address: "House 34, Sector 15, Noida, Uttar Pradesh - 201301",
    panNo: "PAMIT6789H",
    uanNo: "100112233043",
    expCode: "EXP-FIN-043",
    bankName: "State Bank of India",
    bankAccount: "309876543243",
    ifsc: "SBIN0001822",
    about: "Billing & Revenue Operations Associate generating enterprise customer invoices, tracking AR aging, and reconciling gateway payments.",
    skills: ["Revenue Recognition", "Accounts Receivable", "Stripe Billing", "Billing Reconciliations"],
    certifications: ["Chartered Financial Analyst (CFA Level 1)"],
    hobbies: "Badminton, Reading murder mysteries, Terrarium building.",
    monthlyWage: 85000,
  },
];

async function main() {
  console.log("🌱 Starting Dayflow HRMS database seed with complete multi-department workforce & 1-month attendance...");

  const demoEmails = EMPLOYEES.map((e) => e.email);

  // 1. Unlink managers and clean up existing demo records (preserving any real registered users like @gmail.com)
  const existingUsers = await prisma.user.findMany({
    where: { email: { in: demoEmails } },
    select: { id: true },
  });
  const existingUserIds = existingUsers.map((u) => u.id);

  if (existingUserIds.length > 0) {
    console.log(`🧹 Cleaning up ${existingUserIds.length} existing demo users and relations...`);
    await prisma.user.updateMany({
      where: { id: { in: existingUserIds } },
      data: { managerId: null },
    });
    await prisma.attendance.deleteMany({
      where: { employeeId: { in: existingUserIds } },
    });
    await prisma.leaveRequest.deleteMany({
      where: {
        OR: [
          { employeeId: { in: existingUserIds } },
          { reviewedById: { in: existingUserIds } },
        ],
      },
    });
    await prisma.leaveAllocation.deleteMany({
      where: { employeeId: { in: existingUserIds } },
    });
    await prisma.privateInfo.deleteMany({
      where: { userId: { in: existingUserIds } },
    });
    await prisma.resume.deleteMany({
      where: { userId: { in: existingUserIds } },
    });
    await prisma.salaryInfo.deleteMany({
      where: { userId: { in: existingUserIds } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: existingUserIds } },
    });
  }

  const adminHashedPassword = await bcrypt.hash("Admin@12345", 10);
  const employeeHashedPassword = await bcrypt.hash("Employee@123", 10);

  // 2. Insert Employees in Database
  console.log(`👥 Creating ${EMPLOYEES.length} employees across 7 departments...`);
  const createdUsers: any[] = [];
  let adminUserId = "";

  for (const emp of EMPLOYEES) {
    const isEmpAdmin = emp.role === Role.ADMIN;
    const user = await prisma.user.create({
      data: {
        loginId: emp.loginId,
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        password: isEmpAdmin ? adminHashedPassword : employeeHashedPassword,
        mustChangePassword: emp.mustChangePassword ?? false,
        role: emp.role,
        company: emp.company,
        department: emp.department,
        location: emp.location,
        dateOfJoining: new Date(emp.dateOfJoining),
        isActive: true,
        privateInfo: {
          create: {
            dateOfBirth: new Date(emp.dob),
            gender: emp.gender,
            maritalStatus: emp.maritalStatus,
            residingAddress: emp.address,
            nationality: "Indian",
            personalEmail: `${emp.email.split("@")[0]}.personal@gmail.com`,
            panNo: emp.panNo,
            uanNo: emp.uanNo,
            expCode: emp.expCode,
            bankAccountNumber: emp.bankAccount,
            bankName: emp.bankName,
            ifscCode: emp.ifsc,
          },
        },
        resume: {
          create: {
            about: emp.about,
            skills: emp.skills,
            certifications: emp.certifications,
            interestsAndHobbies: emp.hobbies,
          },
        },
        salaryInfo: {
          create: {
            wageType: WageType.FIXED,
            monthlyWage: emp.monthlyWage,
            yearlyWage: emp.monthlyWage * 12,
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
      },
    });

    if (isEmpAdmin) {
      adminUserId = user.id;
    }
    createdUsers.push(user);
  }

  // Link Admin as manager for employees
  if (adminUserId) {
    await prisma.user.updateMany({
      where: {
        id: { in: createdUsers.filter((u) => u.id !== adminUserId).map((u) => u.id) },
      },
      data: { managerId: adminUserId },
    });
  }

  // 3. Generate Authentic Real-World 1-Month Attendance Personas for September 2026 & August 2026
  console.log("⏱️ Generating authentic real-world attendance personas (2-day leaves, zero leaves, sick+half-days, overtime heroes)...");

  type PersonaType =
    | "PERFECT_ATTENDANCE"     // 100% Present (0 leaves, 0 absent, 22/22 days)
    | "TWO_DAYS_LEAVE"        // 2 consecutive days leave (Sep 10 & 11), rest present (20/22 days present, 2 approved leave)
    | "SICK_DAY_AND_HALF_DAY" // Sep 8 Sick leave, Sep 9 Half-day, rest present
    | "THREE_DAYS_VACATION"   // Sep 21-23 Approved PTO (3 days), rest present
    | "ONE_DAY_ABSENT"        // Sep 4 Unexcused absence, rest present
    | "TWO_HALF_DAYS"         // Sep 3 & 17 Half-days, rest present
    | "OVERTIME_HERO"         // 100% Present with 9.5-10.5 hours daily (high overtime)
    | "ONE_DAY_PERSONAL_LEAVE"; // Sep 14 Personal leave, rest present

  const userPersonaMap: Record<string, PersonaType> = {
    "admin@dayflow.com": "PERFECT_ATTENDANCE",
    "aarav.sharma@dayflow.com": "TWO_DAYS_LEAVE", // Aarav: 2 days leave on Sep 10 & 11, rest 100% present!
    "rohan.gupta@dayflow.com": "SICK_DAY_AND_HALF_DAY", // Rohan: Sep 8 sick, Sep 9 half-day doctor follow-up
    "priya.sharma@dayflow.com": "THREE_DAYS_VACATION", // Priya: Sep 21-23 family vacation
    "vikram.malhotra@dayflow.com": "OVERTIME_HERO", // Vikram: Overtime cloud releases, 0 leaves
    "sneha.patel@dayflow.com": "ONE_DAY_ABSENT", // Sneha: Sep 4 unplanned absent
    "ananya.iyer@dayflow.com": "PERFECT_ATTENDANCE", // Ananya: 100% attendance, zero leaves
    "rahul.verma@dayflow.com": "TWO_DAYS_LEAVE", // Rahul: Sep 17 & 18 leave
    "karan.singhania@dayflow.com": "OVERTIME_HERO",
    "tanvi.deshmukh@dayflow.com": "ONE_DAY_PERSONAL_LEAVE", // Tanvi: Sep 14 personal leave
    "natasha.sen@dayflow.com": "TWO_HALF_DAYS", // Natasha: Sep 3 & 17 half days
    "kabir.mehta@dayflow.com": "ONE_DAY_PERSONAL_LEAVE",
    "pooja.reddy@dayflow.com": "TWO_DAYS_LEAVE",
    "aditya.joshi@dayflow.com": "PERFECT_ATTENDANCE", // Aditya: 100% attendance
    "simran.kaur@dayflow.com": "SICK_DAY_AND_HALF_DAY",
    "meera.nambiar@dayflow.com": "TWO_HALF_DAYS",
    "deepak.nair@dayflow.com": "PERFECT_ATTENDANCE", // Deepak: 100% attendance
    "shruti.saxena@dayflow.com": "ONE_DAY_PERSONAL_LEAVE",
    "rajeshwari.pillai@dayflow.com": "PERFECT_ATTENDANCE", // Rajeshwari: 100% attendance
    "amit.kulkarni@dayflow.com": "ONE_DAY_ABSENT",
    "arjun.kapoor@dayflow.com": "PERFECT_ATTENDANCE", // Arjun: 100% attendance
    "divya.menon@dayflow.com": "TWO_DAYS_LEAVE",
    "kunal.bhatia@dayflow.com": "SICK_DAY_AND_HALF_DAY",
    "riya.bansal@dayflow.com": "ONE_DAY_ABSENT",
    "varun.dhawan@dayflow.com": "TWO_HALF_DAYS",
    "siddharth.rao@dayflow.com": "OVERTIME_HERO", // Siddharth: 100% present, 40+ hrs overtime
    "neha.choudhary@dayflow.com": "PERFECT_ATTENDANCE", // Neha: 100% attendance
    "aman.verma@dayflow.com": "TWO_HALF_DAYS",
    "kriti.sanon@dayflow.com": "ONE_DAY_PERSONAL_LEAVE",
    "harsh.vardhan@dayflow.com": "ONE_DAY_ABSENT",
    "radhika.apte@dayflow.com": "TWO_DAYS_LEAVE",
    "alok.mishra@dayflow.com": "THREE_DAYS_VACATION",
    "swati.jain@dayflow.com": "PERFECT_ATTENDANCE", // Swati: 100% attendance
    "gaurav.sethi@dayflow.com": "TWO_DAYS_LEAVE",
    "preeti.agarwal@dayflow.com": "SICK_DAY_AND_HALF_DAY",
    "manish.tiwari@dayflow.com": "ONE_DAY_ABSENT",
    "bhavna.rawat@dayflow.com": "ONE_DAY_PERSONAL_LEAVE",
    "sanjay.singhal@dayflow.com": "PERFECT_ATTENDANCE", // Sanjay (CFO): 100% attendance
    "monika.rao@dayflow.com": "OVERTIME_HERO",
    "tarun.khurana@dayflow.com": "SICK_DAY_AND_HALF_DAY",
    "sunita.agarwal@dayflow.com": "TWO_HALF_DAYS",
    "rakesh.jhunjhunwala@dayflow.com": "THREE_DAYS_VACATION",
    "payal.mittal@dayflow.com": "ONE_DAY_ABSENT",
  };

  const attendanceBatch: any[] = [];
  const leaveRequestsBatch: any[] = [];
  const ptoDaysUsedMap = new Map<string, number>();
  const sickDaysUsedMap = new Map<string, number>();

  const monthsToSeed = [
    { year: 2026, monthIndex: 8, daysInMonth: 30, name: "September 2026" },
    { year: 2026, monthIndex: 7, daysInMonth: 31, name: "August 2026" },
  ];

  for (const user of createdUsers) {
    const empIdx = createdUsers.indexOf(user);
    const persona = userPersonaMap[user.email] || "PERFECT_ATTENDANCE";

    let ptoUsed = 0;
    let sickUsed = 0;

    for (const m of monthsToSeed) {
      for (let day = 1; day <= m.daysInMonth; day++) {
        const curDate = new Date(Date.UTC(m.year, m.monthIndex, day));
        const dayOfWeek = curDate.getUTCDay(); // 0 = Sunday, 6 = Saturday

        // Skip weekends for 5-day week
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        let status: AttendanceStatus = AttendanceStatus.PRESENT;
        let workHours = 8.25;
        let extraHours = 0.25;
        let checkInTime: Date | null = null;
        let checkOutTime: Date | null = null;

        // Apply Persona Rules for September (and similar realistic variation for August)
        if (m.monthIndex === 8) {
          // SEPTEMBER 2026
          if (persona === "PERFECT_ATTENDANCE") {
            // 100% Present, Zero Leaves, Zero Absences
            status = AttendanceStatus.PRESENT;
            const inMin = (empIdx * 3 + day * 5) % 25; // 08:55 to 09:20 AM IST
            const outMin = (empIdx * 7 + day * 9) % 35; // 18:10 to 18:45 PM IST
            checkInTime = new Date(Date.UTC(2026, 8, day, 3, 25 + inMin, 0)); // ~08:55 AM IST
            checkOutTime = new Date(Date.UTC(2026, 8, day, 12, 40 + outMin, 0)); // ~18:10 PM IST
            const gross = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 3600);
            workHours = +(gross - 1.0).toFixed(2);
            extraHours = workHours > 8.0 ? +(workHours - 8.0).toFixed(2) : 0;
          } else if (persona === "TWO_DAYS_LEAVE") {
            // Exactly 2 consecutive days leave (Sep 10 & 11 for some, Sep 17 & 18 for others), rest 100% present!
            const leaveDays = empIdx % 2 === 0 ? [10, 11] : [17, 18];
            if (leaveDays.includes(day)) {
              status = AttendanceStatus.LEAVE;
              workHours = 0;
              extraHours = 0;
              checkInTime = null;
              checkOutTime = null;
              if (day === leaveDays[0]) {
                ptoUsed += 2;
                leaveRequestsBatch.push({
                  employeeId: user.id,
                  leaveType: LeaveType.PAID_TIME_OFF,
                  startDate: new Date(Date.UTC(2026, 8, leaveDays[0])),
                  endDate: new Date(Date.UTC(2026, 8, leaveDays[1])),
                  allocationDays: 2,
                  status: LeaveStatus.APPROVED,
                  reviewedById: adminUserId || null,
                  reviewComment: "Approved planned leave. Have a great break!",
                });
              }
            } else {
              status = AttendanceStatus.PRESENT;
              checkInTime = new Date(Date.UTC(2026, 8, day, 3, 30 + (day % 20), 0));
              checkOutTime = new Date(Date.UTC(2026, 8, day, 12, 45 + (day % 30), 0));
              const gross = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 3600);
              workHours = +(gross - 1.0).toFixed(2);
              extraHours = workHours > 8.0 ? +(workHours - 8.0).toFixed(2) : 0;
            }
          } else if (persona === "SICK_DAY_AND_HALF_DAY") {
            // 1 Sick Day (Sep 8) + 1 Half-Day Doctor Follow-up (Sep 9), rest present
            if (day === 8) {
              status = AttendanceStatus.LEAVE;
              workHours = 0;
              extraHours = 0;
              sickUsed += 1;
              leaveRequestsBatch.push({
                employeeId: user.id,
                leaveType: LeaveType.SICK_LEAVE,
                startDate: new Date(Date.UTC(2026, 8, 8)),
                endDate: new Date(Date.UTC(2026, 8, 8)),
                allocationDays: 1,
                status: LeaveStatus.APPROVED,
                reviewedById: adminUserId || null,
                reviewComment: "Approved sick leave. Take care and get well soon.",
                attachmentUrl: "https://dayflow.internal/attachments/medical-certificate.pdf",
              });
            } else if (day === 9) {
              status = AttendanceStatus.HALF_DAY;
              checkInTime = new Date(Date.UTC(2026, 8, 9, 3, 45, 0)); // 09:15 AM IST
              checkOutTime = new Date(Date.UTC(2026, 8, 9, 8, 0, 0)); // 13:30 PM IST
              workHours = 4.25;
              extraHours = 0;
            } else {
              status = AttendanceStatus.PRESENT;
              checkInTime = new Date(Date.UTC(2026, 8, day, 3, 30 + (day % 25), 0));
              checkOutTime = new Date(Date.UTC(2026, 8, day, 12, 45 + (day % 25), 0));
              const gross = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 3600);
              workHours = +(gross - 1.0).toFixed(2);
              extraHours = workHours > 8.0 ? +(workHours - 8.0).toFixed(2) : 0;
            }
          } else if (persona === "THREE_DAYS_VACATION") {
            // 3-Day Approved Vacation (Sep 21, 22, 23), rest present
            if (day >= 21 && day <= 23) {
              status = AttendanceStatus.LEAVE;
              workHours = 0;
              extraHours = 0;
              if (day === 21) {
                ptoUsed += 3;
                leaveRequestsBatch.push({
                  employeeId: user.id,
                  leaveType: LeaveType.PAID_TIME_OFF,
                  startDate: new Date(Date.UTC(2026, 8, 21)),
                  endDate: new Date(Date.UTC(2026, 8, 23)),
                  allocationDays: 3,
                  status: LeaveStatus.APPROVED,
                  reviewedById: adminUserId || null,
                  reviewComment: "Approved family vacation.",
                });
              }
            } else {
              status = AttendanceStatus.PRESENT;
              checkInTime = new Date(Date.UTC(2026, 8, day, 3, 35 + (day % 20), 0));
              checkOutTime = new Date(Date.UTC(2026, 8, day, 12, 40 + (day % 25), 0));
              const gross = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 3600);
              workHours = +(gross - 1.0).toFixed(2);
              extraHours = workHours > 8.0 ? +(workHours - 8.0).toFixed(2) : 0;
            }
          } else if (persona === "ONE_DAY_ABSENT") {
            // 1 Unexcused Absent day (Sep 4), rest 21 working days present
            if (day === 4) {
              status = AttendanceStatus.ABSENT;
              workHours = 0;
              extraHours = 0;
            } else {
              status = AttendanceStatus.PRESENT;
              checkInTime = new Date(Date.UTC(2026, 8, day, 3, 30 + (day % 25), 0));
              checkOutTime = new Date(Date.UTC(2026, 8, day, 12, 45 + (day % 25), 0));
              const gross = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 3600);
              workHours = +(gross - 1.0).toFixed(2);
              extraHours = workHours > 8.0 ? +(workHours - 8.0).toFixed(2) : 0;
            }
          } else if (persona === "TWO_HALF_DAYS") {
            // 2 Half-Days (Sep 3 & Sep 17), rest 20 working days present
            if (day === 3 || day === 17) {
              status = AttendanceStatus.HALF_DAY;
              checkInTime = new Date(Date.UTC(2026, 8, day, 3, 45, 0)); // 09:15 AM IST
              checkOutTime = new Date(Date.UTC(2026, 8, day, 8, 0, 0)); // 13:30 PM IST
              workHours = 4.25;
              extraHours = 0;
            } else {
              status = AttendanceStatus.PRESENT;
              checkInTime = new Date(Date.UTC(2026, 8, day, 3, 30 + (day % 20), 0));
              checkOutTime = new Date(Date.UTC(2026, 8, day, 12, 45 + (day % 30), 0));
              const gross = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 3600);
              workHours = +(gross - 1.0).toFixed(2);
              extraHours = workHours > 8.0 ? +(workHours - 8.0).toFixed(2) : 0;
            }
          } else if (persona === "OVERTIME_HERO") {
            // 100% Present, Zero Leaves, Heavy Overtime (10.0+ hours every day)
            status = AttendanceStatus.PRESENT;
            checkInTime = new Date(Date.UTC(2026, 8, day, 3, 15, 0)); // 08:45 AM IST
            checkOutTime = new Date(Date.UTC(2026, 8, day, 14, 15, 0)); // 19:45 PM IST
            workHours = 10.0;
            extraHours = 2.0;
          } else {
            // ONE_DAY_PERSONAL_LEAVE (Sep 14), rest present
            if (day === 14) {
              status = AttendanceStatus.LEAVE;
              workHours = 0;
              extraHours = 0;
              ptoUsed += 1;
              leaveRequestsBatch.push({
                employeeId: user.id,
                leaveType: LeaveType.PAID_TIME_OFF,
                startDate: new Date(Date.UTC(2026, 8, 14)),
                endDate: new Date(Date.UTC(2026, 8, 14)),
                allocationDays: 1,
                status: LeaveStatus.APPROVED,
                reviewedById: adminUserId || null,
                reviewComment: "Approved personal leave day.",
              });
            } else {
              status = AttendanceStatus.PRESENT;
              checkInTime = new Date(Date.UTC(2026, 8, day, 3, 30 + (day % 25), 0));
              checkOutTime = new Date(Date.UTC(2026, 8, day, 12, 45 + (day % 25), 0));
              const gross = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 3600);
              workHours = +(gross - 1.0).toFixed(2);
              extraHours = workHours > 8.0 ? +(workHours - 8.0).toFixed(2) : 0;
            }
          }
        } else {
          // AUGUST 2026 (Month 7): Realistic completed month
          const augSeed = (empIdx * 19 + day * 7) % 25;
          if (augSeed === 0 && persona !== "PERFECT_ATTENDANCE" && persona !== "OVERTIME_HERO") {
            status = AttendanceStatus.LEAVE;
            workHours = 0;
            extraHours = 0;
          } else if (augSeed === 1 && (persona === "TWO_HALF_DAYS" || persona === "SICK_DAY_AND_HALF_DAY")) {
            status = AttendanceStatus.HALF_DAY;
            checkInTime = new Date(Date.UTC(2026, 7, day, 3, 45, 0));
            checkOutTime = new Date(Date.UTC(2026, 7, day, 8, 0, 0));
            workHours = 4.25;
            extraHours = 0;
          } else {
            status = AttendanceStatus.PRESENT;
            checkInTime = new Date(Date.UTC(2026, 7, day, 3, 30 + (day % 25), 0));
            checkOutTime = new Date(Date.UTC(2026, 7, day, 12, 45 + (day % 30), 0));
            const gross = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 3600);
            workHours = +(gross - 1.0).toFixed(2);
            extraHours = workHours > 8.0 ? +(workHours - 8.0).toFixed(2) : 0;
          }
        }

        attendanceBatch.push({
          employeeId: user.id,
          date: curDate,
          checkInTime,
          checkOutTime,
          workHours,
          extraHours,
          status,
        });
      }
    }

    ptoDaysUsedMap.set(user.id, ptoUsed);
    sickDaysUsedMap.set(user.id, sickUsed);

    // Today's Live Dashboard Attendance record (Sunday, Sep 13, 2026)
    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const todayStatus =
      persona === "PERFECT_ATTENDANCE" || persona === "OVERTIME_HERO"
        ? AttendanceStatus.PRESENT
        : empIdx % 9 === 0
        ? AttendanceStatus.LEAVE
        : empIdx % 7 === 0
        ? AttendanceStatus.ABSENT
        : AttendanceStatus.PRESENT;

    attendanceBatch.push({
      employeeId: user.id,
      date: todayOnly,
      checkInTime:
        todayStatus === AttendanceStatus.PRESENT
          ? new Date(todayOnly.getTime() + (9 * 3600 + 15 * 60) * 1000)
          : null,
      checkOutTime: null,
      workHours: todayStatus === AttendanceStatus.PRESENT ? 4.5 : 0,
      extraHours: 0,
      status: todayStatus,
    });
  }

  // Update Leave Allocation used balances to match actual leave taken
  console.log("📊 Updating leave allocation balances according to real leaves taken...");
  for (const user of createdUsers) {
    const pto = ptoDaysUsedMap.get(user.id) || 0;
    const sick = sickDaysUsedMap.get(user.id) || 0;

    await prisma.leaveAllocation.updateMany({
      where: { employeeId: user.id, leaveType: LeaveType.PAID_TIME_OFF },
      data: { used: pto },
    });
    await prisma.leaveAllocation.updateMany({
      where: { employeeId: user.id, leaveType: LeaveType.SICK_LEAVE },
      data: { used: sick },
    });
  }

  // Bulk Insert Attendance Records
  console.log(`💾 Inserting ${attendanceBatch.length} realistic attendance rows into database...`);
  await prisma.attendance.createMany({
    data: attendanceBatch,
    skipDuplicates: true,
  });

  // Provision upcoming PENDING leave requests for manager approval workflows
  console.log("📝 Provisioning upcoming pending leave requests for approval dashboard...");
  leaveRequestsBatch.push(
    {
      employeeId: createdUsers[1].id, // Aarav Sharma
      leaveType: LeaveType.PAID_TIME_OFF,
      startDate: new Date(Date.UTC(2026, 8, 24)),
      endDate: new Date(Date.UTC(2026, 8, 25)),
      allocationDays: 2,
      status: LeaveStatus.PENDING,
      attachmentUrl: null,
    },
    {
      employeeId: createdUsers[7].id, // Rohan Gupta
      leaveType: LeaveType.SICK_LEAVE,
      startDate: new Date(Date.UTC(2026, 8, 16)),
      endDate: new Date(Date.UTC(2026, 8, 16)),
      allocationDays: 1,
      status: LeaveStatus.PENDING,
      attachmentUrl: "https://dayflow.internal/attachments/doctor-prescription.pdf",
    },
    {
      employeeId: createdUsers[20].id, // Siddharth Rao
      leaveType: LeaveType.PAID_TIME_OFF,
      startDate: new Date(Date.UTC(2026, 8, 28)),
      endDate: new Date(Date.UTC(2026, 8, 29)),
      allocationDays: 2,
      status: LeaveStatus.PENDING,
      attachmentUrl: null,
    }
  );

  console.log(`💾 Inserting ${leaveRequestsBatch.length} leave requests (Approved + Pending)...`);
  await prisma.leaveRequest.createMany({
    data: leaveRequestsBatch,
  });

  console.log("\n========================================================");
  console.log("🎉 DAYFLOW HRMS SEED COMPLETED SUCCESSFULLY!");
  console.log("========================================================");
  console.log(`📊 Total Employees Seeded : ${EMPLOYEES.length}`);
  console.log(`🏢 Categories / Departments:`);
  console.log(`   • Human Resources : 6 staff (including Admin)`);
  console.log(`   • Engineering     : 7 staff (including Aarav Sharma)`);
  console.log(`   • Product Design  : 6 staff (including Rohan Gupta)`);
  console.log(`   • Marketing       : 6 staff (including Priya Sharma)`);
  console.log(`   • Sales           : 6 staff`);
  console.log(`   • Operations      : 6 staff`);
  console.log(`   • Finance         : 6 staff`);
  console.log(`⏱️ Attendance Records    : ~${attendanceBatch.length} entries covering Aug & Sep 2026`);
  console.log("--------------------------------------------------------");
  console.log("🔑 ADMIN CREDENTIALS:");
  console.log("   • Login ID : OIADMI20260001");
  console.log("   • Email    : admin@dayflow.com");
  console.log("   • Password : Admin@12345");
  console.log("--------------------------------------------------------");
  console.log("👤 SAMPLE EMPLOYEE CREDENTIALS (Password: Employee@123 for all):");
  console.log("   • Engineering    : Aarav Sharma   (OIAASH20260002 / aarav.sharma@dayflow.com)");
  console.log("   • Engineering    : Vikram Malhotra(OIVIMA20260005 / vikram.malhotra@dayflow.com)");
  console.log("   • Product Design : Rohan Gupta    (OIROGU20260003 / rohan.gupta@dayflow.com)");
  console.log("   • Marketing      : Priya Sharma   (OIPRSH20260004 / priya.sharma@dayflow.com)");
  console.log("   • Sales          : Siddharth Rao  (OISIRA20260026 / siddharth.rao@dayflow.com)");
  console.log("   • Operations     : Alok Mishra    (OIALMI20260032 / alok.mishra@dayflow.com)");
  console.log("   • Finance        : Sanjay Singhal (OISASI20260038 / sanjay.singhal@dayflow.com)");
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

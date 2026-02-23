export interface Exam {
  id: string;
  name: string;
  code: string;
  duration: number;
  questions: number;
  passingScore: number;
  price: number;
  level: string;
  description: string;
  featured?: boolean;
  gradient: string;
}

export interface Organization {
  id: string;
  name: string;
  description: string;
  logo: string;
  color: string;
  exams: Exam[];
}

export const mockData: Organization[] = [
  {
    id: "isc2",
    name: "ISC2",
    description: "Information Systems Security Certification Consortium",
    logo: "ISC2",
    color: "from-orange-500 to-red-600",
    exams: [
      {
        id: "cc",
        name: "CC",
        code: "ISC2-CC",
        duration: 180,
        questions: 100,
        passingScore: 700,
        price: 599,
        level: "Beginner",
        description: "Certified in Cybersecurity",
        gradient: "from-orange-300 to-red-400",
      },

      {
        id: "sscp",
        name: "SSCP",
        code: "ISC2-SSCP",
        duration: 150,
        questions: 125,
        passingScore: 700,
        price: 249,
        level: "Intermediate",
        description: "Security operations and administration certification",
        gradient: "from-orange-500 to-red-600",
      },

      {
        id: "cissp",
        name: "CISSP",
        code: "ISC2-CISSP",
        duration: 180,
        questions: 150,
        passingScore: 700,
        price: 749,
        level: "Advanced",
        description:
          "The premier cybersecurity certification for experienced professionals",
        featured: true,
        gradient: "from-orange-600 to-red-700",
      },
      {
        id: "ccsp",
        name: "CCSP",
        code: "ISC2-CCSP",
        duration: 165,
        questions: 125,
        passingScore: 700,
        price: 599,
        level: "Advanced",
        description: "Cloud security certification for IT leaders",
        gradient: "from-orange-500 to-red-600",
      },
    ],
  },
  {
    id: "aws",
    name: "AWS",
    description: "Amazon Web Services Certifications",
    logo: "AWS",
    color: "from-yellow-400 to-orange-500",
    exams: [
      {
        id: "solutions-architect",
        name: "Solutions Architect Professional",
        code: "AWS-SAP-C02",
        duration: 170,
        questions: 75,
        passingScore: 720,
        price: 300,
        level: "Professional",
        description: "Design distributed systems on AWS",
        featured: true,
        gradient: "from-yellow-500 to-orange-600",
      },
      {
        id: "developer-associate",
        name: "Developer Associate",
        code: "AWS-DVA-C02",
        duration: 130,
        questions: 65,
        passingScore: 720,
        price: 150,
        level: "Associate",
        description: "Develop and maintain AWS applications",
        gradient: "from-yellow-400 to-orange-500",
      },
      {
        id: "sysops-admin",
        name: "SysOps Administrator Associate",
        code: "AWS-SOA-C02",
        duration: 130,
        questions: 65,
        passingScore: 720,
        price: 150,
        level: "Associate",
        description: "Deploy and operate workloads on AWS",
        gradient: "from-yellow-400 to-orange-500",
      },
      {
        id: "devops-engineer",
        name: "DevOps Engineer Professional",
        code: "AWS-DOP-C02",
        duration: 170,
        questions: 75,
        passingScore: 720,
        price: 300,
        level: "Professional",
        description: "Provision and operate AWS services",
        gradient: "from-yellow-500 to-orange-600",
      },
    ],
  },
  {
    id: "cfa",
    name: "CFA Institute",
    description: "Chartered Financial Analyst",
    logo: "CFA",
    color: "from-blue-600 to-indigo-700",
    exams: [
      {
        id: "cfa-level-1",
        name: "CFA Level I",
        code: "CFA-L1",
        duration: 270,
        questions: 180,
        passingScore: 70,
        price: 1000,
        level: "Level I",
        description: "Foundation of investment tools and concepts",
        featured: true,
        gradient: "from-blue-600 to-indigo-700",
      },
      {
        id: "cfa-level-2",
        name: "CFA Level II",
        code: "CFA-L2",
        duration: 270,
        questions: 90,
        passingScore: 70,
        price: 1000,
        level: "Level II",
        description: "Application of investment tools and concepts",
        gradient: "from-blue-600 to-indigo-700",
      },
      {
        id: "cfa-level-3",
        name: "CFA Level III",
        code: "CFA-L3",
        duration: 270,
        questions: 60,
        passingScore: 70,
        price: 1000,
        level: "Level III",
        description: "Portfolio management and wealth planning",
        gradient: "from-blue-600 to-indigo-700",
      },
    ],
  },
];

export const featuredExams = mockData.flatMap((org) =>
  org.exams.filter((exam) => exam.featured)
);

import { Button } from "@/components/ui/button";

interface Exam {
  id: string;
  name: string;
  code: string;
  duration: number;
  questions: number;
  passingScore: number;
  price: number;
  level: string;
}

interface Organization {
  id: string;
  name: string;
  description: string;
  logo: string;
  exams: Exam[];
}

const mockData: Organization[] = [
  {
    id: "isc2",
    name: "ISC2",
    description: "Information Systems Security Certification Consortium",
    logo: "ISC2",
    exams: [
      {
        id: "cissp",
        name: "CISSP",
        code: "ISC2-CISSP",
        duration: 180,
        questions: 150,
        passingScore: 700,
        price: 749,
        level: "Advanced",
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
      },
    ],
  },
  {
    id: "aws",
    name: "AWS",
    description: "Amazon Web Services Certifications",
    logo: "AWS",
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
      },
    ],
  },
  {
    id: "cfa",
    name: "CFA Institute",
    description: "Chartered Financial Analyst",
    logo: "CFA",
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
      },
    ],
  },
];

export default function Catalog() {
  return (
    <div className="my-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold uppercase">Exam Catalog</h1>
        <p className="mt-2 font-light text-lg">
          Browse and prepare for your certification exams
        </p>
      </div>

      {mockData.map((org) => (
        <div key={org.id} className="mb-12">
          <div className="mb-4 border-b pb-2">
            <h2 className="text-2xl font-bold">{org.name}</h2>
            <p className="text-muted-foreground">{org.description}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {org.exams.map((exam) => (
              <div
                key={exam.id}
                className="border rounded-lg p-6 hover:border-primary transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{exam.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {exam.code}
                    </p>
                  </div>
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                    {exam.level}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium text-foreground">
                      {exam.duration} min
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Questions:</span>
                    <span className="font-medium text-foreground">
                      {exam.questions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passing Score:</span>
                    <span className="font-medium text-foreground">
                      {exam.passingScore}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-medium text-foreground">
                      ${exam.price}
                    </span>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

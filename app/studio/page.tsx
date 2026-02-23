"use client";

import { useState } from "react";
import { ChevronRight, Plus, Edit, Trash2, FolderOpen } from "lucide-react";

interface Concept {
  id: string;
  title: string;
}

interface Module {
  moduleNumber: number;
  title: string;
  concepts: Concept[];
}

interface Domain {
  id: string;
  domainNumber: number;
  title: string;
  weight: number;
  minQuestions: number;
  maxQuestions: number;
  modules: Module[];
}

interface Exam {
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
  domains: Domain[];
}

interface Organization {
  id: string;
  name: string;
  description: string;
  logo: string;
  color: string;
  exams: Exam[];
}

type View = "orgs" | "org" | "exam" | "domain" | "module" | "concept";

const initialData: Organization[] = [
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
        domains: [],
      },
    ],
  },
];

export default function Studio() {
  const [organizations, setOrganizations] = useState<Organization[]>(initialData);
  const [currentView, setCurrentView] = useState<View>("orgs");

  void setOrganizations;
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  const breadcrumb = () => {
    const items = [{ label: "Organizations", view: "orgs" as View }];
    if (selectedOrg) {
      items.push({ label: selectedOrg.name, view: "org" as View });
    }
    if (selectedExam) {
      items.push({ label: selectedExam.name, view: "exam" as View });
    }
    if (selectedDomain) {
      items.push({ label: selectedDomain.title, view: "domain" as View });
    }
    if (selectedModule) {
      items.push({ label: selectedModule.title, view: "module" as View });
    }
    return items;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur-lg sticky top-0 z-50">
        <div className="flex items-center px-6 py-4">
          <h1 className="text-2xl font-bold">Studio</h1>
        </div>
      </div>

      <div className="flex">
        <aside className="w-64 border-r min-h-[calc(100vh-65px)] p-4">
          <nav className="space-y-1">
            <button
              onClick={() => {
                setCurrentView("orgs");
                setSelectedOrg(null);
                setSelectedExam(null);
                setSelectedDomain(null);
                setSelectedModule(null);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === "orgs" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              }`}
            >
              <FolderOpen className="w-5 h-5" />
              <span>Organizations</span>
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <nav className="flex items-center gap-2 mb-6 text-sm">
            {breadcrumb().map((item, index) => (
              <div key={item.label} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                <button
                  onClick={() => {
                    setCurrentView(item.view);
                    if (item.view === "orgs") {
                      setSelectedOrg(null);
                      setSelectedExam(null);
                      setSelectedDomain(null);
                      setSelectedModule(null);
                    } else if (item.view === "org" && selectedOrg) {
                      setSelectedExam(null);
                      setSelectedDomain(null);
                      setSelectedModule(null);
                    } else if (item.view === "exam" && selectedExam) {
                      setSelectedDomain(null);
                      setSelectedModule(null);
                    } else if (item.view === "domain" && selectedDomain) {
                      setSelectedModule(null);
                    }
                  }}
                  className={`transition-colors hover:text-foreground ${
                    index === breadcrumb().length - 1 ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </button>
              </div>
            ))}
          </nav>

          {currentView === "orgs" && (
            <div className="space-y-4">
              <button
                className="w-full flex items-center gap-3 px-6 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Add Organization</span>
              </button>
              <div className="grid gap-4">
                {organizations.map((org) => (
                  <div
                    key={org.id}
                    onClick={() => {
                      setSelectedOrg(org);
                      setCurrentView("org");
                    }}
                    className="flex items-center justify-between p-6 bg-card border rounded-lg hover:border-primary transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-lg bg-gradient-to-br ${org.color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                      >
                        {org.logo}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{org.name}</h3>
                        <p className="text-sm text-muted-foreground">{org.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {org.exams.length} exam{org.exams.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === "org" && selectedOrg && (
            <div className="space-y-4">
              <button
                className="w-full flex items-center gap-3 px-6 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Add Exam</span>
              </button>
              <div className="grid gap-4">
                {selectedOrg.exams.map((exam) => (
                  <div
                    key={exam.id}
                    onClick={() => {
                      setSelectedExam(exam);
                      setCurrentView("exam");
                    }}
                    className="flex items-center justify-between p-6 bg-card border rounded-lg hover:border-primary transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-lg bg-gradient-to-br ${exam.gradient} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                      >
                        {exam.code.split("-")[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{exam.name}</h3>
                        <p className="text-sm text-muted-foreground">{exam.code}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {exam.domains.length} domain{exam.domains.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === "exam" && selectedExam && (
            <div className="space-y-4">
              <button
                className="w-full flex items-center gap-3 px-6 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Add Domain</span>
              </button>
              <div className="grid gap-4">
                {selectedExam.domains.map((domain) => (
                  <div
                    key={domain.id}
                    onClick={() => {
                      setSelectedDomain(domain);
                      setCurrentView("domain");
                    }}
                    className="flex items-center justify-between p-6 bg-card border rounded-lg hover:border-primary transition-colors cursor-pointer group"
                  >
                    <div>
                      <h3 className="font-semibold text-lg">
                        Domain {domain.domainNumber}: {domain.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Weight: {domain.weight}% | {domain.minQuestions}-{domain.maxQuestions} questions
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {domain.modules.length} module{domain.modules.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === "domain" && selectedDomain && (
            <div className="space-y-4">
              <button
                className="w-full flex items-center gap-3 px-6 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Add Module</span>
              </button>
              <div className="grid gap-4">
                {selectedDomain.modules.map((module) => (
                  <div
                    key={module.moduleNumber}
                    onClick={() => {
                      setSelectedModule(module);
                      setCurrentView("module");
                    }}
                    className="flex items-center justify-between p-6 bg-card border rounded-lg hover:border-primary transition-colors cursor-pointer group"
                  >
                    <div>
                      <h3 className="font-semibold text-lg">
                        Module {module.moduleNumber}: {module.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {module.concepts.length} concept{module.concepts.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === "module" && selectedModule && (
            <div className="space-y-4">
              <button
                className="w-full flex items-center gap-3 px-6 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Add Concept</span>
              </button>
              <div className="grid gap-4">
                {selectedModule.concepts.map((concept) => (
                  <div
                    key={concept.id}
                    className="flex items-center justify-between p-6 bg-card border rounded-lg hover:border-primary transition-colors cursor-pointer group"
                  >
                    <div>
                      <h3 className="font-semibold text-lg">{concept.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                        <Edit className="w-5 h-5 text-muted-foreground" />
                      </button>
                      <button className="p-2 hover:bg-destructive hover:text-destructive-foreground rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

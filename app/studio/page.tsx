"use client";

import { useState } from "react";
import { Search, Plus, Edit, Trash2, ChevronRight, Filter, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface Concept {
  id: string;
  title: string;
}

interface Module {
  id: string;
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

interface Course {
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
  courses: Course[];
}

type View = "orgs" | "org" | "course" | "domain" | "module" | "concept";
type ModalType = "org" | "course" | "domain" | "module" | "concept" | null;

const initialData: Organization[] = [
  {
    id: "isc2",
    name: "ISC2",
    description: "Information Systems Security Certification Consortium",
    logo: "ISC2",
    color: "from-orange-500 to-red-600",
    courses: [
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
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOrg, setFilterOrg] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState<ModalType>(null);
  const [modalData, setModalData] = useState<Record<string, string>>({});

  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterOrg === "all" || org.id === filterOrg;
    return matchesSearch && matchesFilter;
  });

  const breadcrumb = () => {
    const items = [{ label: "Organizations", view: "orgs" as View }];
    if (selectedOrg) items.push({ label: selectedOrg.name, view: "org" as View });
    if (selectedCourse) items.push({ label: selectedCourse.name, view: "course" as View });
    if (selectedDomain) items.push({ label: selectedDomain.title, view: "domain" as View });
    if (selectedModule) items.push({ label: selectedModule.title, view: "module" as View });
    return items;
  };

  const closeModal = () => {
    setModalOpen(null);
    setModalData({});
  };

  const openModal = (type: ModalType) => {
    setModalOpen(type);
  };

  const handleAdd = () => {
    const newData = { ...modalData };
    
    if (modalOpen === "org" && selectedOrg) {
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        name: newData.name || "New Course",
        code: newData.code || "NEW-CODE",
        duration: parseInt(newData.duration) || 180,
        questions: parseInt(newData.questions) || 100,
        passingScore: parseInt(newData.passingScore) || 700,
        price: parseInt(newData.price) || 599,
        level: newData.level || "Beginner",
        description: newData.description || "New course description",
        gradient: selectedOrg.color,
        domains: [],
      };
      setOrganizations(orgs =>
        orgs.map(org =>
          org.id === selectedOrg?.id
            ? { ...org, courses: [...org.courses, newCourse] }
            : org
        )
      );
    } else if (modalOpen === "course" && selectedCourse) {
      const newDomain: Domain = {
        id: `domain-${Date.now()}`,
        domainNumber: selectedCourse.domains.length + 1,
        title: newData.title || "New Domain",
        weight: parseInt(newData.weight) || 10,
        minQuestions: parseInt(newData.minQuestions) || 10,
        maxQuestions: parseInt(newData.maxQuestions) || 15,
        modules: [],
      };
      setOrganizations(orgs =>
        orgs.map(org =>
          org.id === selectedOrg?.id
            ? {
                ...org,
                courses: org.courses.map(course =>
                  course.id === selectedCourse?.id
                    ? { ...course, domains: [...course.domains, newDomain] }
                    : course
                ),
              }
            : org
        )
      );
    } else if (modalOpen === "domain" && selectedDomain) {
      const newModule: Module = {
        id: `module-${Date.now()}`,
        moduleNumber: selectedDomain.modules.length + 1,
        title: newData.title || "New Module",
        concepts: [],
      };
      setOrganizations(orgs =>
        orgs.map(org =>
          org.id === selectedOrg?.id
            ? {
                ...org,
                courses: org.courses.map(course =>
                  course.id === selectedCourse?.id
                    ? {
                        ...course,
                        domains: course.domains.map(domain =>
                          domain.id === selectedDomain?.id
                            ? { ...domain, modules: [...domain.modules, newModule] }
                            : domain
                        ),
                      }
                    : course
                ),
              }
            : org
        )
      );
    } else if (modalOpen === "module" && selectedModule) {
      const newConcept: Concept = {
        id: `concept-${Date.now()}`,
        title: newData.title || "New Concept",
      };
      setOrganizations(orgs =>
        orgs.map(org =>
          org.id === selectedOrg?.id
            ? {
                ...org,
                courses: org.courses.map(course =>
                  course.id === selectedCourse?.id
                    ? {
                        ...course,
                        domains: course.domains.map(domain =>
                          domain.id === selectedDomain?.id
                            ? {
                                ...domain,
                                modules: domain.modules.map(module =>
                                  module.id === selectedModule?.id
                                    ? { ...module, concepts: [...module.concepts, newConcept] }
                                    : module
                                ),
                              }
                            : domain
                        ),
                      }
                    : course
                ),
              }
            : org
        )
      );
    } else if (modalOpen === "org") {
      const newOrg: Organization = {
        id: `org-${Date.now()}`,
        name: newData.name || "New Organization",
        description: newData.description || "New organization description",
        logo: (newData.name || "NEW").substring(0, 4).toUpperCase(),
        color: "from-blue-500 to-indigo-600",
        courses: [],
      };
      setOrganizations([...organizations, newOrg]);
    }

    closeModal();
  };

  const handleDelete = (type: string, id: string) => {
    if (type === "concept" && selectedModule) {
      setOrganizations(orgs =>
        orgs.map(org =>
          org.id === selectedOrg?.id
            ? {
                ...org,
                courses: org.courses.map(course =>
                  course.id === selectedCourse?.id
                    ? {
                        ...course,
                        domains: course.domains.map(domain =>
                          domain.id === selectedDomain?.id
                            ? {
                                ...domain,
                                modules: domain.modules.map(module =>
                                  module.id === selectedModule?.id
                                    ? {
                                        ...module,
                                        concepts: module.concepts.filter(c => c.id !== id),
                                      }
                                    : module
                                ),
                              }
                            : domain
                        ),
                      }
                    : course
                ),
              }
            : org
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="border-b bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Studio</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search organizations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg bg-secondary/50 border border-transparent focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-64"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={filterOrg}
                  onChange={(e) => setFilterOrg(e.target.value)}
                  className="rounded-lg bg-secondary/50 border border-transparent focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all px-3 py-2"
                >
                  <option value="all">All Organizations</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <nav className="flex items-center gap-2 mb-8 text-sm overflow-x-auto">
          {breadcrumb().map((item, index) => (
            <div key={item.label} className="flex items-center gap-2 flex-shrink-0">
              {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              <button
                onClick={() => {
                  setCurrentView(item.view);
                  if (item.view === "orgs") {
                    setSelectedOrg(null);
                    setSelectedCourse(null);
                    setSelectedDomain(null);
                    setSelectedModule(null);
                  } else if (item.view === "org" && selectedOrg) {
                    setSelectedCourse(null);
                    setSelectedDomain(null);
                    setSelectedModule(null);
                  } else if (item.view === "course" && selectedCourse) {
                    setSelectedDomain(null);
                    setSelectedModule(null);
                  } else if (item.view === "domain" && selectedDomain) {
                    setSelectedModule(null);
                  }
                }}
                className={`transition-colors hover:text-foreground font-medium ${
                  index === breadcrumb().length - 1 ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </button>
            </div>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {currentView === "orgs" && (
              <div className="space-y-6">
                <button
                  onClick={() => openModal("org")}
                  className="w-full md:w-auto flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl transition-all font-medium shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Organization</span>
                </button>
                <div className="grid gap-6">
                  {filteredOrgs.map((org) => (
                    <motion.div
                      key={org.id}
                      onClick={() => {
                        setSelectedOrg(org);
                        setCurrentView("org");
                      }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="group cursor-pointer"
                    >
                      <div className="flex items-center justify-between p-6 bg-gradient-to-br from-card to-card/50 border rounded-2xl hover:border-primary transition-all overflow-hidden">
                        <div className="flex items-center gap-6">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                            className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${org.color} flex items-center justify-center text-white font-bold text-2xl shadow-xl`}
                          >
                            {org.logo}
                          </motion.div>
                          <div>
                            <h3 className="font-bold text-2xl mb-2">{org.name}</h3>
                            <p className="text-muted-foreground mb-3">{org.description}</p>
                            <p className="text-sm font-medium text-muted-foreground">
                              {org.courses.length} course{org.courses.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {currentView === "org" && selectedOrg && (
              <div className="space-y-6">
                <button
                  onClick={() => openModal("course")}
                  className="w-full md:w-auto flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl transition-all font-medium shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Course</span>
                </button>
                <div className="grid gap-4 md:gap-6">
                  {selectedOrg.courses.map((course) => (
                    <motion.div
                      key={course.id}
                      onClick={() => {
                        setSelectedCourse(course);
                        setCurrentView("course");
                      }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="group cursor-pointer"
                    >
                      <div className="flex items-center justify-between p-6 bg-card border rounded-2xl hover:border-primary transition-all">
                        <div className="flex items-center gap-6">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                            className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${course.gradient} flex items-center justify-center text-white font-bold text-2xl shadow-xl`}
                          >
                            {course.code.split("-")[0]}
                          </motion.div>
                          <div>
                            <h3 className="font-bold text-xl mb-2">{course.name}</h3>
                            <p className="text-sm text-muted-foreground mb-1">{course.code}</p>
                            <p className="text-xs font-medium text-muted-foreground">
                              {course.domains.length} domain{course.domains.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {currentView === "course" && selectedCourse && (
              <div className="space-y-6">
                <button
                  onClick={() => openModal("domain")}
                  className="w-full md:w-auto flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl transition-all font-medium shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Domain</span>
                </button>
                <div className="grid gap-4 md:gap-6">
                  {selectedCourse.domains.map((domain) => (
                    <motion.div
                      key={domain.id}
                      onClick={() => {
                        setSelectedDomain(domain);
                        setCurrentView("domain");
                      }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="group cursor-pointer"
                    >
                      <div className="flex items-center justify-between p-6 bg-card border rounded-2xl hover:border-primary transition-all">
                        <div className="flex-1">
                          <h3 className="font-bold text-xl mb-2">
                            Domain {domain.domainNumber}: {domain.title}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                              Weight: {domain.weight}%
                            </span>
                            <span>{domain.minQuestions}-{domain.maxQuestions} questions</span>
                            <span>{domain.modules.length} module{domain.modules.length !== 1 ? "s" : ""}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {currentView === "domain" && selectedDomain && (
              <div className="space-y-6">
                <button
                  onClick={() => openModal("module")}
                  className="w-full md:w-auto flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl transition-all font-medium shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Module</span>
                </button>
                <div className="grid gap-4 md:gap-6">
                  {selectedDomain.modules.map((module) => (
                    <motion.div
                      key={module.id}
                      onClick={() => {
                        setSelectedModule(module);
                        setCurrentView("module");
                      }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="group cursor-pointer"
                    >
                      <div className="flex items-center justify-between p-6 bg-card border rounded-2xl hover:border-primary transition-all">
                        <div className="flex-1">
                          <h3 className="font-bold text-xl mb-2">
                            Module {module.moduleNumber}: {module.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {module.concepts.length} concept{module.concepts.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {currentView === "module" && selectedModule && (
              <div className="space-y-6">
                <button
                  onClick={() => openModal("concept")}
                  className="w-full md:w-auto flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl transition-all font-medium shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Concept</span>
                </button>
                <div className="grid gap-4">
                  {selectedModule.concepts.map((concept) => (
                    <motion.div
                      key={concept.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="relative"
                    >
                      <div className="p-6 bg-card border rounded-2xl hover:border-primary transition-all">
                        <div className="flex items-start justify-between">
                          <h3 className="font-bold text-lg">{concept.title}</h3>
                          <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                              <Edit className="w-5 h-5 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => handleDelete("concept", concept.id)}
                              className="p-2 hover:bg-destructive hover:text-destructive-foreground rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              transition={{ duration: 0.3 }}
              className="bg-background rounded-2xl shadow-2xl border w-full max-w-lg mx-4 p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  Add {modalOpen.charAt(0).toUpperCase() + modalOpen.slice(1)}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {modalOpen === "org" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        value={modalData.name || ""}
                        onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Enter organization name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={modalData.description || ""}
                        onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px]"
                        placeholder="Enter description"
                      />
                    </div>
                  </>
                )}

                {modalOpen === "course" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        value={modalData.name || ""}
                        onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Enter course name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Code</label>
                      <input
                        type="text"
                        value={modalData.code || ""}
                        onChange={(e) => setModalData({ ...modalData, code: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="e.g., ISC2-CC"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Duration (min)</label>
                        <input
                          type="number"
                          value={modalData.duration || ""}
                          onChange={(e) => setModalData({ ...modalData, duration: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="180"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Questions</label>
                        <input
                          type="number"
                          value={modalData.questions || ""}
                          onChange={(e) => setModalData({ ...modalData, questions: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="100"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Passing Score</label>
                        <input
                          type="number"
                          value={modalData.passingScore || ""}
                          onChange={(e) => setModalData({ ...modalData, passingScore: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Price ($)</label>
                        <input
                          type="number"
                          value={modalData.price || ""}
                          onChange={(e) => setModalData({ ...modalData, price: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="599"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Level</label>
                      <select
                        value={modalData.level || ""}
                        onChange={(e) => setModalData({ ...modalData, level: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option value="">Select level</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Professional">Professional</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={modalData.description || ""}
                        onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px]"
                        placeholder="Enter course description"
                      />
                    </div>
                  </>
                )}

                {modalOpen === "domain" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <input
                        type="text"
                        value={modalData.title || ""}
                        onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Enter domain title"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Weight (%)</label>
                        <input
                          type="number"
                          value={modalData.weight || ""}
                          onChange={(e) => setModalData({ ...modalData, weight: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Min Questions</label>
                        <input
                          type="number"
                          value={modalData.minQuestions || ""}
                          onChange={(e) => setModalData({ ...modalData, minQuestions: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Max Questions</label>
                        <input
                          type="number"
                          value={modalData.maxQuestions || ""}
                          onChange={(e) => setModalData({ ...modalData, maxQuestions: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="15"
                        />
                      </div>
                    </div>
                  </>
                )}

                {modalOpen === "module" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      value={modalData.title || ""}
                      onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="Enter module title"
                    />
                  </div>
                )}

                {modalOpen === "concept" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      value={modalData.title || ""}
                      onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="Enter concept title"
                    />
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 rounded-lg border border-input bg-background hover:bg-accent transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    className="flex-1 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

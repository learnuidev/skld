"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Command, BookOpen, DollarSign, Clock, GraduationCap } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
  organization?: string;
}

const mockExams: Exam[] = [
  {
    id: "cissp",
    name: "CISSP",
    code: "ISC2-CISSP",
    duration: 180,
    questions: 150,
    passingScore: 700,
    price: 749,
    level: "Advanced",
    description: "The premier cybersecurity certification for experienced professionals",
    featured: true,
    gradient: "from-orange-600 to-red-700",
    organization: "ISC2",
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
    organization: "ISC2",
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
    organization: "ISC2",
  },
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
    organization: "AWS",
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
    organization: "AWS",
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
    organization: "AWS",
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
    organization: "AWS",
  },
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
    organization: "CFA Institute",
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
    organization: "CFA Institute",
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
    organization: "CFA Institute",
  },
];

interface SearchDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSearch?: (query: string) => void;
}

export function SearchDialog({ open: controlledOpen, onOpenChange, onSearch }: SearchDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchKey = useRef(0);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const filteredExams = mockExams.filter(
    (exam) =>
      exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.organization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    setSelectedIndex(0);
  };

  const resetState = useRef(() => {
    setSearchQuery("");
    setSelectedIndex(0);
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
      if (open) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredExams.length - 1 ? prev + 1 : prev
          );
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        }
        if (e.key === "Enter" && filteredExams.length > 0) {
          e.preventDefault();
          const selected = filteredExams[selectedIndex];
          onSearch?.(selected.name);
          window.location.href = `/catalog`;
          setOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, filteredExams, selectedIndex, setOpen, onSearch]);

  useEffect(() => {
    if (open) {
      resetState.current();
    }
  }, [open]);

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-primary/20 text-primary rounded px-1">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-4xl h-[600px] flex flex-col p-0 gap-0 overflow-hidden"
      >
        <div className="border-b p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search exams, certifications, or organizations..."
              value={searchQuery}
              onChange={(e) => handleSearchQueryChange(e.target.value)}
              autoFocus
              className="w-full pl-12 pr-12 py-4 bg-transparent border-0 focus:outline-none text-lg"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground">
              <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs">
                <Command className="h-3 w-3" />
                <span>K</span>
              </kbd>
              {searchQuery && (
                <button
                  onClick={() => handleSearchQueryChange("")}
                  className="hover:bg-muted rounded-full p-1 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {searchQuery === "" ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  Popular Searches
                </h3>
                <div className="space-y-1">
                  {["CISSP", "AWS Solutions Architect", "CFA Level I", "SSCP"].map(
                    (term) => (
                      <button
                        key={term}
                        onClick={() => setSearchQuery(term)}
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-accent transition-colors flex items-center justify-between group"
                      >
                        <span>{term}</span>
                        <Search className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  Browse by Organization
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {["ISC2", "AWS", "CFA Institute"].map((org) => (
                    <button
                      key={org}
                      onClick={() => setSearchQuery(org)}
                      className="px-4 py-3 rounded-lg border hover:bg-accent transition-colors text-sm font-medium"
                    >
                      {org}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  Recent
                </h3>
                <div className="text-sm text-muted-foreground">
                  No recent searches
                </div>
              </div>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No results found</p>
              <p className="text-sm text-muted-foreground">
                Try searching for another term
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredExams.map((exam, index) => (
                <button
                  key={exam.id}
                  onClick={() => {
                    onSearch?.(exam.name);
                    window.location.href = `/catalog`;
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-4 rounded-lg border hover:border-primary transition-all group flex items-start gap-4",
                    index === selectedIndex && "border-primary bg-accent"
                  )}
                >
                  <div
                    className={cn(
                      "flex-none w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0",
                      exam.gradient
                    )}
                  >
                    {exam.code.split("-")[0]}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-base">
                        {highlightMatch(exam.name, searchQuery)}
                      </h4>
                      {exam.featured && (
                        <span className="shrink-0 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                      {highlightMatch(exam.code, searchQuery)}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {highlightMatch(exam.description, searchQuery)}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" />
                        {exam.level}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {exam.questions} Questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {exam.duration}min
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {exam.price}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="h-5 px-1.5 rounded bg-muted border text-[10px]">↑</kbd>
              <kbd className="h-5 px-1.5 rounded bg-muted border text-[10px]">↓</kbd>
              <span>to navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="h-5 px-1.5 rounded bg-muted border text-[10px]">↵</kbd>
              <span>to select</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="h-5 px-1.5 rounded bg-muted border text-[10px]">esc</kbd>
              <span>to close</span>
            </div>
          </div>
          <div>{filteredExams.length} result{filteredExams.length !== 1 ? "s" : ""}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

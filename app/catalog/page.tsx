"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SearchDialog } from "@/components/search-dialog";
import { Search, ChevronLeft, ChevronRight, Play, Info, Command } from "lucide-react";

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
}

interface Organization {
  id: string;
  name: string;
  description: string;
  logo: string;
  color: string;
  exams: Exam[];
}

const mockData: Organization[] = [
  {
    id: "isc2",
    name: "ISC2",
    description: "Information Systems Security Certification Consortium",
    logo: "ISC2",
    color: "from-orange-500 to-red-600",
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
        description: "The premier cybersecurity certification for experienced professionals",
        featured: true,
        gradient: "from-orange-600 to-red-700",
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

const featuredExams = mockData.flatMap((org) =>
  org.exams.filter((exam) => exam.featured)
);

export default function Catalog() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFeatured, setCurrentFeatured] = useState(0);

  const filteredData = mockData.map((org) => ({
    ...org,
    exams: org.exams.filter(
      (exam) =>
        exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((org) => org.exams.length > 0);

  const scrollCarousel = (direction: "left" | "right", elementId: string) => {
    const container = document.getElementById(elementId);
    if (container) {
      const scrollAmount = 400;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const nextFeatured = () => {
    setCurrentFeatured((prev) => (prev + 1) % featuredExams.length);
  };

  const prevFeatured = () => {
    setCurrentFeatured((prev) => (prev - 1 + featuredExams.length) % featuredExams.length);
  };

  const currentFeaturedExam = featuredExams[currentFeatured];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="py-4 px-4 md:px-8">
          <button
            onClick={() => setSearchOpen(true)}
            className="relative w-full max-w-2xl mx-auto flex items-center gap-3 px-4 py-3 rounded-full bg-secondary/50 border-2 border-transparent hover:border-primary hover:bg-secondary/70 transition-all text-left text-sm md:text-base group"
          >
            <Search className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-muted-foreground group-hover:text-foreground transition-colors">
              Search for courses...
            </span>
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs text-muted-foreground">
              <Command className="h-3 w-3" />
              <span>K</span>
            </kbd>
          </button>
        </div>
      </div>

      <SearchDialog 
        open={searchOpen} 
        onOpenChange={setSearchOpen}
        onSearch={setSearchQuery}
      />

      <div className="relative h-[500px] md:h-[600px] overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-r ${currentFeaturedExam.gradient} transition-all duration-700`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-4 md:px-8 flex items-center">
          <div className="max-w-2xl space-y-6">
            <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              Featured Certification
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              {currentFeaturedExam.name}
            </h1>
            <p className="text-xl text-white/90">
              {currentFeaturedExam.description}
            </p>
            <div className="flex flex-wrap gap-3 text-white/80">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {currentFeaturedExam.questions} Questions
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {currentFeaturedExam.duration} Minutes
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {currentFeaturedExam.level}
              </span>
            </div>
            <div className="flex gap-4 pt-4">
              <Button size="lg" className="bg-white text-black hover:bg-white/90 px-8">
                <Play className="w-5 h-5 mr-2" />
                Start Practice
              </Button>
              <Button size="lg" variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30 px-8">
                <Info className="w-5 h-5 mr-2" />
                Learn More
              </Button>
            </div>
          </div>
        </div>

        <button
          onClick={prevFeatured}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextFeatured}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-10"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {featuredExams.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentFeatured(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentFeatured ? "bg-white w-8" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-16">
        {filteredData.map((org) => (
          <div key={org.id} className="space-y-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${org.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
              >
                {org.logo}
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">{org.name}</h2>
                <p className="text-muted-foreground">{org.description}</p>
              </div>
            </div>

            <div className="relative group">
              <div
                id={`carousel-${org.id}`}
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                style={{ scrollbarWidth: "none" }}
              >
                {org.exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex-none w-72 md:w-80 group/card"
                  >
                    <div
                      className={`relative aspect-[2/3] rounded-xl overflow-hidden bg-gradient-to-br ${exam.gradient} shadow-xl group-hover/card:scale-105 transition-transform duration-300`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                          {exam.level}
                        </span>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="font-bold text-lg mb-1">{exam.name}</h3>
                        <p className="text-sm text-white/80 mb-3">
                          {exam.code}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold">${exam.price}</span>
                          <div className="flex gap-2">
                            <span className="px-2 py-1 bg-white/20 rounded text-xs">
                              {exam.questions}Q
                            </span>
                            <span className="px-2 py-1 bg-white/20 rounded text-xs">
                              {exam.duration}m
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <Button size="lg" className="bg-white text-black hover:bg-white/90">
                          <Play className="w-5 h-5 mr-2" />
                          Start
                        </Button>
                        <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/20">
                          <Info className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {exam.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => scrollCarousel("left", `carousel-${org.id}`)}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 bg-background/90 hover:bg-background border shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => scrollCarousel("right", `carousel-${org.id}`)}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-12 h-12 bg-background/90 hover:bg-background border shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              No exams found matching &ldquo;{searchQuery}&rdquo;
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

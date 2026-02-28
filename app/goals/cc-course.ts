export const ccCourse = {
  id: "cc-certified-in-cybersecurity",
  title: "CC – Certified in Cybersecurity",
  domains: [
    {
      id: "d1-security-principles",
      domainNumber: 1,
      title: "Security Principles",

      weight: 26,
      minQuestions: 26,
      maxQuestions: 33,

      modules: [
        {
          moduleNumber: 1,
          title: "Understand the Security Concepts of Information Assurance",
          concepts: [
            { id: "confidentiality", title: "Confidentiality" },
            { id: "integrity", title: "Integrity" },
            { id: "availability", title: "Availability" },
            {
              id: "authentication",
              title:
                "Authentication (e.g., methods of authentication, multi-factor authentication (MFA))",
            },
            { id: "non-repudiation", title: "Non-repudiation" },
            { id: "privacy", title: "Privacy" },
          ],
        },
        {
          moduleNumber: 2,
          title: "Understand the risk management process",
          concepts: [
            {
              id: "risk-management",
              title: "Risk management (e.g., risk priorities, risk tolerance)",
            },
            {
              id: "risk-identification",
              title: "Risk identification",
            },
            {
              id: "risk-assessment",
              title: "Risk assessment",
            },
            {
              id: "risk-treatment",
              title: "Risk treatment",
            },
          ],
        },
        {
          moduleNumber: 3,
          title: "Understand security controls",
          concepts: [
            { id: "technical-controls", title: "Technical controls" },
            { id: "administrative-controls", title: "Administrative controls" },
            { id: "physical-controls", title: "Physical controls" },
          ],
        },
        {
          moduleNumber: 4,
          title: "Understand ISC2 Code of Ethics",
          concepts: [
            {
              id: "professional-code-of-conduct",
              title: "Professional code of conduct",
            },
          ],
        },
        {
          moduleNumber: 5,
          title: "Understand governance processes",
          concepts: [
            { id: "policies", title: "Policies" },
            { id: "procedures", title: "Procedures" },
            { id: "standards", title: "Standards" },
            { id: "regulations-and-laws", title: "Regulations and laws" },
          ],
        },
      ],
    },
    {
      id: "d2-business-continuity",
      domainNumber: 2,
      weight: 10,
      minQuestions: 10,
      maxQuestions: 13,
      title:
        "Business Continuity (BC), Disaster Recovery (DR) & Incident Response Concepts",
    },
    {
      id: "d3-access-controls-concepts",
      domainNumber: 3,
      title: "Access Controls Concepts",
      weight: 22,
      minQuestions: 22,
      maxQuestions: 28,
    },
    {
      id: "d4-network-security",
      domainNumber: 4,
      weight: 24,
      minQuestions: 24,
      maxQuestions: 30,
      title: "Network Security",
    },
    {
      id: "d5-security-operations",
      domainNumber: 5,
      weight: 18,
      minQuestions: 18,
      maxQuestions: 23,
      title: "Security Operations",
    },
  ],
};

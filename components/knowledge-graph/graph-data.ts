"use client";

import { GraphData } from "./knowledge-graph.types";

export const NODE_RADIUS: Record<string, number> = {
  actor: 40,
  attribute: 35,
  motivation: 32,
};

export const NODE_COLORS: Record<string, string> = {
  actor: "#FF6B6B",
  attribute: "#4ECDC4",
  motivation: "#FFD93D",
};

export const STROKE_WIDTHS: Record<string, number> = {
  high: 4,
  medium: 2.5,
  low: 1.5,
};

export const graphData: GraphData = {
  nodes: [
    {
      id: "nation_state",
      group: "actor",
      type: "actor",
      label: "Nation State",
      description:
        "Government-backed cyber operatives with substantial resources",
      examples: [
        "China's APT41",
        "Russia's GRU (Fancy Bear)",
        "North Korea's Lazarus Group",
        "Iran's APT33",
      ],
      color: NODE_COLORS.actor,
      weight: 2,
    },
    {
      id: "apt",
      group: "actor",
      type: "actor",
      label: "APT",
      description:
        "Advanced Persistent Threat - Sophisticated, focused cyberattacks by well-funded opponents",
      examples: [
        "APT29 (Cozy Bear)",
        "APT38 (Lazarus)",
        "APT10 (Cloud Hopper)",
        "APT1 (Comment Crew)",
      ],
      color: NODE_COLORS.actor,
      weight: 2,
    },
    {
      id: "unskilled_attacker",
      group: "actor",
      type: "actor",
      label: "Unskilled Attacker",
      description:
        "Novice with limited hacking skills, uses off-the-shelf tools",
      examples: [
        "Script kiddies using LOIC for DDoS",
        "Teens using purchased RATs",
        "Dark web tool purchasers",
      ],
      color: NODE_COLORS.actor,
      weight: 1,
    },
    {
      id: "hacktivist",
      group: "actor",
      type: "actor",
      label: "Hacktivist",
      description: "Activist hacker with political or social agenda",
      examples: ["Anonymous", "LulzSec", "OurMine", "Syrian Electronic Army"],
      color: NODE_COLORS.actor,
      weight: 1.5,
    },
    {
      id: "insider_threat",
      group: "actor",
      type: "actor",
      label: "Insider Threat",
      description:
        "Trusted insider posing cybersecurity risks (intentional or accidental)",
      examples: [
        "Edward Snowden (NSA)",
        "Chelsea Manning",
        "Tesla sabotage incident",
        "Wayfair contractor data theft",
      ],
      color: NODE_COLORS.actor,
      weight: 2,
    },
    {
      id: "organized_crime",
      group: "actor",
      type: "actor",
      label: "Organized Crime",
      description: "Criminal group seeking financial gain via cybercrime",
      examples: [
        "REvil ransomware gang",
        "DarkSide (Colonial Pipeline)",
        "Conti group",
        "Carbanak gang",
      ],
      color: NODE_COLORS.actor,
      weight: 2,
    },
    {
      id: "shadow_it",
      group: "actor",
      type: "actor",
      label: "Shadow IT",
      description: "Unauthorized, unregulated tech use within an organization",
      examples: [
        "Employees using Dropbox for work files",
        "Unofficial Slack channels",
        "Personal Gmail for business",
        "Unauthorized AWS instances",
      ],
      color: NODE_COLORS.actor,
      weight: 1,
    },
    {
      id: "internal_external",
      group: "attribute",
      type: "attribute",
      label: "Internal/External",
      description: "Originating from within or outside an entity",
      examples: [
        "Internal: Disgruntled sysadmin",
        "External: Foreign nation-state",
        "Hybrid: Insider working with outsiders",
      ],
      color: NODE_COLORS.attribute,
      weight: 1.5,
    },
    {
      id: "resources_funding",
      group: "attribute",
      type: "attribute",
      label: "Resources/Funding",
      description: "Availability of financial and technological support",
      examples: [
        "High: Nation-state budgets ($1B+)",
        "Medium: Organized crime ($10M+)",
        "Low: Script kiddies ($100-1000)",
      ],
      color: NODE_COLORS.attribute,
      weight: 1.5,
    },
    {
      id: "sophistication",
      group: "attribute",
      type: "attribute",
      label: "Sophistication",
      description: "Level of expertise and technological proficiency",
      examples: [
        "High: Zero-day exploits",
        "Medium: Custom malware",
        "Low: Pre-made tools",
      ],
      color: NODE_COLORS.attribute,
      weight: 1.5,
    },
    {
      id: "data_exfiltration",
      group: "motivation",
      type: "motivation",
      label: "Data Exfiltration",
      description: "Stealing sensitive data for illicit purposes",
      examples: [
        "Equifax breach (143M records)",
        "Marriott breach (500M guests)",
        "Yahoo breach (3B accounts)",
      ],
      color: NODE_COLORS.motivation,
      weight: 1.5,
    },
    {
      id: "espionage",
      group: "motivation",
      type: "motivation",
      label: "Espionage",
      description:
        "Gathering information for intelligence or competitive advantage",
      examples: [
        "Operation Aurora (Google)",
        "OPM breach (21.5M records)",
        "NotPetya (Ukraine attacks)",
      ],
      color: NODE_COLORS.motivation,
      weight: 1.5,
    },
    {
      id: "service_disruption",
      group: "motivation",
      type: "motivation",
      label: "Service Disruption",
      description: "Disrupting systems or services intentionally",
      examples: [
        "Dyn DDoS attack (2016)",
        "WannaCry ransomware",
        "Log4j exploitation",
      ],
      color: NODE_COLORS.motivation,
      weight: 1.5,
    },
    {
      id: "blackmail",
      group: "motivation",
      type: "motivation",
      label: "Blackmail",
      description: "Extortion using compromising information",
      examples: [
        "Hollywood Presbyterian ransomware",
        "Colonial Pipeline attack",
        "JBS Foods ransomware",
      ],
      color: NODE_COLORS.motivation,
      weight: 1.5,
    },
    {
      id: "financial_gain",
      group: "motivation",
      type: "motivation",
      label: "Financial Gain",
      description: "Profiting from cybercriminal activities",
      examples: [
        "Carbanak gang ($1B stolen)",
        "Bangladesh Bank heist ($81M)",
        "Cryptojacking campaigns",
      ],
      color: NODE_COLORS.motivation,
      weight: 2,
    },
    {
      id: "philosophical_beliefs",
      group: "motivation",
      type: "motivation",
      label: "Philosophical",
      description: "Pursuing digital activism or ideology",
      examples: [
        "Anonymous attacking Westboro Baptist",
        "Anti-police brutality hacktivism",
        "Environmental activist hacks",
      ],
      color: NODE_COLORS.motivation,
      weight: 1.5,
    },
    {
      id: "ethical",
      group: "motivation",
      type: "motivation",
      label: "Ethical",
      description: "Cyber actions aligned with moral principles",
      examples: [
        "Bug bounty researchers",
        "Vulnerability disclosure programs",
        "Marcus Hutchins (WannaCry kill switch)",
      ],
      color: NODE_COLORS.motivation,
      weight: 1,
    },
    {
      id: "revenge",
      group: "motivation",
      type: "motivation",
      label: "Revenge",
      description: "Retaliatory actions driven by personal vendettas",
      examples: [
        "Uber data breach (2016) - fired employee",
        "Morgan Stanley ex-employee data theft",
        "UK school admin password change revenge",
      ],
      color: NODE_COLORS.motivation,
      weight: 1.5,
    },
    {
      id: "disruption_chaos",
      group: "motivation",
      type: "motivation",
      label: "Disruption",
      description: "Creating chaos and confusion for various reasons",
      examples: [
        "Anonymous attacking Scientology",
        "LulzSec's 50-day rampage",
        "4chan's Project Chanology",
      ],
      color: NODE_COLORS.motivation,
      weight: 1,
    },
    {
      id: "war",
      group: "motivation",
      type: "motivation",
      label: "War",
      description: "Engaging in cyber warfare or military conflict",
      examples: [
        "Russia-Georgia cyber war (2008)",
        "Stuxnet (Iran nuclear)",
        "Ukraine power grid attacks",
      ],
      color: NODE_COLORS.motivation,
      weight: 2,
    },
    {
      id: "ideology",
      group: "motivation",
      type: "motivation",
      label: "Ideological",
      description: "Driven by strong beliefs or principles",
      examples: [
        "ISIS propaganda operations",
        "Chinese social credit system protests",
        "Hong Kong democracy activists",
      ],
      color: NODE_COLORS.motivation,
      weight: 1.5,
    },
  ],
  links: [
    {
      source: "nation_state",
      target: "apt",
      value: 3,
      description:
        "Nation states deploy APTs as sophisticated cyber weapons for long-term operations",
      realExample:
        "Russia's GRU deployed APT28 (Fancy Bear) to target the DNC during 2016 US elections. China's PLA deployed APT1 to steal intellectual property from US defense contractors.",
      strength: "high",
      color: NODE_COLORS.actor,
    },
    {
      source: "nation_state",
      target: "resources_funding",
      value: 3,
      description:
        "Nation states have virtually unlimited government funding and resources",
      realExample:
        "The US Cyber Command has a budget of over $4 billion annually. China's cyber operations employ an estimated 50,000+ personnel across military and civilian units.",
      strength: "high",
      color: NODE_COLORS.attribute,
    },
    {
      source: "nation_state",
      target: "sophistication",
      value: 3,
      description:
        "State actors develop zero-day exploits and custom hardware implants",
      realExample:
        "Stuxnet used four zero-day exploits and sophisticated code to physically destroy Iranian centrifuges. Equation Group's disk firmware malware was undetectable for years.",
      strength: "high",
      color: NODE_COLORS.attribute,
    },
    {
      source: "nation_state",
      target: "espionage",
      value: 3,
      description:
        "Intelligence gathering is the primary mission of state-sponsored hackers",
      realExample:
        "Chinese APT10 compromised 14 global IT management firms to steal data from their clients (Cloud Hopper operation). Russian hackers accessed State Department email systems for diplomatic intelligence.",
      strength: "high",
      color: NODE_COLORS.motivation,
    },
    {
      source: "nation_state",
      target: "war",
      value: 3,
      description: "Cyber operations now integral to modern warfare doctrine",
      realExample:
        "Russia's NotPetya attack on Ukraine (2017) caused $10B in damages globally. Israel and US Stuxnet operation against Iran's nuclear program (physical destruction through cyber means).",
      strength: "high",
      color: NODE_COLORS.motivation,
    },
    {
      source: "apt",
      target: "resources_funding",
      value: 3,
      description:
        "APTs are well-funded by nation-states or criminal enterprises",
      realExample:
        "Lazarus Group (North Korea) stole over $2 billion through bank heists and cryptocurrency theft. DarkHotel APT operates from luxury hotels with government backing.",
      strength: "high",
      color: NODE_COLORS.attribute,
    },
    {
      source: "apt",
      target: "sophistication",
      value: 3,
      description: "APTs use advanced techniques to maintain persistent access",
      realExample:
        "APT29 (Cozy Bear) remained undetected in DNC networks for over a year using custom malware. Equation Group's malware could reprogram hard drive firmware.",
      strength: "high",
      color: NODE_COLORS.attribute,
    },
    {
      source: "apt",
      target: "espionage",
      value: 3,
      description: "APTs specialize in long-term intelligence gathering",
      realExample:
        "APT1 (Comment Crew) operated from Shanghai for 7+ years, stealing 6.5TB of data from 141 organizations. APT41 conducted both espionage and financially motivated attacks simultaneously.",
      strength: "high",
      color: NODE_COLORS.motivation,
    },
    {
      source: "apt",
      target: "data_exfiltration",
      value: 3,
      description:
        "APTs steal data gradually over extended periods to avoid detection",
      realExample:
        "Deep Panda APT exfiltrated 4TB of data from US Joint Chiefs of Staff over 8 months. APT10 stole intellectual property from 350+ companies worldwide.",
      strength: "high",
      color: NODE_COLORS.motivation,
    },
    {
      source: "unskilled_attacker",
      target: "resources_funding",
      value: 1,
      description:
        "Limited personal resources, may purchase tools from dark web for $50-500",
      realExample:
        "Teenager purchased DDoS-for-hire service for $19.99 to take down school websites. Script kiddies buy RATs (Remote Access Trojans) for $30-100 on dark web forums.",
      strength: "low",
      color: NODE_COLORS.attribute,
    },
    {
      source: "unskilled_attacker",
      target: "sophistication",
      value: 1,
      description:
        "Low sophistication, relies on YouTube tutorials and pre-made tools",
      realExample:
        "14-year-old used LOIC (Low Orbit Ion Cannon) to participate in Anonymous DDoS attacks without understanding how it worked. Teenagers using purchased RATs to spy on webcam girls.",
      strength: "low",
      color: NODE_COLORS.attribute,
    },
    {
      source: "unskilled_attacker",
      target: "financial_gain",
      value: 2,
      description:
        "Often motivated by quick money through ransomware-as-a-service",
      realExample:
        "College student used ransomware kit to infect 100+ computers, demanding $300 each. Teenager made $50,000 through SIM swapping attacks on crypto investors.",
      strength: "medium",
      color: NODE_COLORS.motivation,
    },
    {
      source: "unskilled_attacker",
      target: "disruption_chaos",
      value: 2,
      description: "May cause chaos for notoriety, bragging rights, or 'lulz'",
      realExample:
        "LulzSec (average age 19) hacked PBS, Sony, and CIA websites for attention. 16-year-old hacked Apple's internal systems just to prove it could be done.",
      strength: "medium",
      color: NODE_COLORS.motivation,
    },
    {
      source: "hacktivist",
      target: "philosophical_beliefs",
      value: 3,
      description: "Core motivation is advancing political or social causes",
      realExample:
        "Anonymous attacked the Church of Scientology (Project Chanology) for religious freedom. Syrian Electronic Army defaced news sites supporting opposition forces.",
      strength: "high",
      color: NODE_COLORS.motivation,
    },
    {
      source: "hacktivist",
      target: "ideology",
      value: 3,
      description: "Strong ideological beliefs drive hacktivist operations",
      realExample:
        "AntiSec movement targeted government agencies to protest surveillance. OurMine hacked high-profile accounts to promote their security company.",
      strength: "high",
      color: NODE_COLORS.motivation,
    },
    {
      source: "hacktivist",
      target: "service_disruption",
      value: 3,
      description:
        "Website defacement and DDoS attacks are common protest methods",
      realExample:
        "Anonymous took down CIA.gov for 3 hours. Greek hacktivists disrupted government websites during austerity protests. Myanmar hacktivists attack military websites post-coup.",
      strength: "high",
      color: NODE_COLORS.motivation,
    },
    {
      source: "hacktivist",
      target: "data_exfiltration",
      value: 2,
      description: "May leak sensitive data to expose perceived wrongdoing",
      realExample:
        "Anonymous leaked 70GB of BART police data after shooting. GhostSec leaked ISIS training documents. AntiSec released 12 million Apple UDIDs.",
      strength: "medium",
      color: NODE_COLORS.motivation,
    },
    {
      source: "insider_threat",
      target: "internal_external",
      value: 3,
      description: "Classic internal threat with legitimate access",
      realExample:
        "Edward Snowden (NSA contractor) had administrator access to top-secret systems. Tesla employee modified manufacturing software and exfiltrated data to third parties.",
      strength: "high",
      color: NODE_COLORS.attribute,
    },
    {
      source: "insider_threat",
      target: "revenge",
      value: 3,
      description:
        "Disgruntled employees often act out of revenge after termination",
      realExample:
        "Morgan Stanley employee stole data of 350,000 clients after being fired. UK school employee changed all staff passwords out of revenge. Wayfair contractor stole data after contract dispute.",
      strength: "high",
      color: NODE_COLORS.motivation,
    },
    {
      source: "insider_threat",
      target: "financial_gain",
      value: 2,
      description: "May sell access or data to competitors/criminals",
      realExample:
        "Goldman Sachs programmer stole trading code for Chinese bank ($100M offer). Coca-Cola employee sold trade secrets to Pepsi for $30,000.",
      strength: "medium",
      color: NODE_COLORS.motivation,
    },
    {
      source: "insider_threat",
      target: "data_exfiltration",
      value: 3,
      description:
        "Insiders can easily bypass security using legitimate credentials",
      realExample:
        "NSA contractor stole 50TB of classified data over 20 years. Boeing engineer stole 300,000+ files. Anthem breach traced to stolen developer credentials.",
      strength: "high",
      color: NODE_COLORS.motivation,
    },
    {
      source: "organized_crime",
      target: "financial_gain",
      value: 3,
      description: "Primary motivation is profit through cybercrime",
      realExample:
        "Carbanak gang stole $1 billion from banks worldwide. FIN7 group made $100M+ through point-of-sale breaches. Cobalt group targeted ATMs globally.",
      strength: "high",
      color: NODE_COLORS.motivation,
    },
    {
      source: "organized_crime",
      target: "blackmail",
      value: 3,
      description: "Ransomware-as-a-service is now a major criminal enterprise",
      realExample:
        "DarkSide collected $90M+ in Bitcoin from Colonial Pipeline and others. REvil demanded $70M from Kaseya and $50M from Apple. Conti group extorted $25M from healthcare orgs.",
      strength: "high",
      color: NODE_COLORS.motivation,
    },
    {
      source: "organized_crime",
      target: "data_exfiltration",
      value: 3,
      description: "Stolen data is sold on dark web markets for profit",
      realExample:
        "Joker's Stash sold 40M+ stolen credit cards. Genesis Market sold 1.5M+ browser fingerprints. 2.2B records from 12 breaches sold on dark web in 2023.",
      strength: "high",
      color: NODE_COLORS.motivation,
    },
    {
      source: "organized_crime",
      target: "resources_funding",
      value: 2.5,
      description: "Well-funded with sophisticated criminal infrastructure",
      realExample:
        "REvil operated as a business with customer support and marketing. Conti had 24/7 call centers for ransom negotiations. DarkSide had investor dividends for affiliates.",
      strength: "high",
      color: NODE_COLORS.attribute,
    },
    {
      source: "shadow_it",
      target: "internal_external",
      value: 3,
      description: "Internal users accessing external unauthorized services",
      realExample:
        "Sales team using personal Gmail to share customer lists. Developers uploading code to personal GitHub. Employees using unapproved cloud storage for work files.",
      strength: "high",
      color: NODE_COLORS.attribute,
    },
    {
      source: "shadow_it",
      target: "ethical",
      value: 2,
      description: "Often not malicious - just trying to be productive",
      realExample:
        "Marketing team using Canva without approval (85% of companies have shadow IT). Engineers using personal AWS for testing. Remote workers using personal devices.",
      strength: "medium",
      color: NODE_COLORS.motivation,
    },
    {
      source: "shadow_it",
      target: "data_exfiltration",
      value: 2,
      description:
        "Accidental exposure through unauthorized services is common",
      realExample:
        "Uber data exposed in personal GitHub repo. Tesla IP leaked through employee's personal cloud. Zoom bombing incidents from unsecured personal meeting links.",
      strength: "medium",
      color: NODE_COLORS.motivation,
    },
    {
      source: "resources_funding",
      target: "sophistication",
      value: 3,
      description:
        "More resources enable higher sophistication and custom tools",
      realExample:
        "NSA's Tailored Access Operations unit has $1B+ budget for zero-days. Chinese PLA units have 1000+ researchers. In contrast, script kiddies use $30 LOIC tools.",
      strength: "high",
      color: NODE_COLORS.attribute,
    },
    {
      source: "financial_gain",
      target: "blackmail",
      value: 3,
      description: "Ransomware is the primary method for cyber extortion",
      realExample:
        "Colonial Pipeline paid $4.4M in Bitcoin to DarkSide. JBS Foods paid $11M. CNA Financial paid $40M. Average ransom payment now over $800,000.",
      strength: "high",
      color: NODE_COLORS.motivation,
    },
    {
      source: "financial_gain",
      target: "data_exfiltration",
      value: 3,
      description: "Stolen data is monetized through multiple channels",
      realExample:
        "Credit card details sell for $5-100 each on dark web. Medical records sell for $250-1000. Corporate espionage data can fetch millions from competitors.",
      strength: "high",
      color: NODE_COLORS.motivation,
    },
    {
      source: "espionage",
      target: "war",
      value: 3,
      description:
        "Cyber espionage often precedes or accompanies military action",
      realExample:
        "Russian GRU mapped Ukrainian power grid before 2015 attacks. Chinese military cyber units active in South China Sea disputes. Iranian hackers targeted Saudi Aramco before attacks.",
      strength: "high",
      color: NODE_COLORS.motivation,
    },
    {
      source: "philosophical_beliefs",
      target: "ideology",
      value: 3,
      description:
        "Philosophical beliefs and ideology are closely linked drivers",
      realExample:
        "Environmental activists hack oil companies. Pro-democracy groups target authoritarian regimes. Anti-fascist hackers attack white supremacist sites.",
      strength: "high",
      color: NODE_COLORS.motivation,
    },
    {
      source: "revenge",
      target: "service_disruption",
      value: 2,
      description: "Revenge often manifests as service disruption",
      realExample:
        "Ex-Uber driver deleted customer records. Fired sysadmin deleted 180 servers at Medidata. Former employee wiped 20TB of backup data at insurance company.",
      strength: "medium",
      color: NODE_COLORS.motivation,
    },
    {
      source: "organized_crime",
      target: "sophistication",
      value: 2.5,
      description:
        "Criminal groups now employ developers, testers, and support staff",
      realExample:
        "Carbanak had dedicated reverse engineers. Ryuk ransomware had custom binary per victim. TrickBot had modular architecture with 20+ specialized components.",
      strength: "high",
      color: NODE_COLORS.attribute,
    },
    {
      source: "hacktivist",
      target: "revenge",
      value: 1.5,
      description:
        "Some hacktivism is driven by revenge against perceived enemies",
      realExample:
        "Anonymous hacked HBGary Federal after CEO threatened to expose members. LulzSec attacked Sony in retaliation for PS3 jailbreak lawsuit.",
      strength: "medium",
      color: NODE_COLORS.motivation,
    },
    {
      source: "insider_threat",
      target: "espionage",
      value: 2,
      description: "Insiders may be recruited by foreign intelligence services",
      realExample:
        "CIA agent Aldrich Ames sold secrets to Russia for $4.6M. FBI agent Robert Hanssen spied for Russia for 22 years. NSA translator sold secrets for $600,000.",
      strength: "medium",
      color: NODE_COLORS.motivation,
    },
    {
      source: "apt",
      target: "war",
      value: 2,
      description: "APTs can be precursors to or components of cyber warfare",
      realExample:
        "Russian APT29 and APT28 were active in Ukraine months before 2022 invasion. Chinese APT41 conducted both espionage and disruptive attacks on critical infrastructure.",
      strength: "medium",
      color: NODE_COLORS.motivation,
    },
    {
      source: "nation_state",
      target: "internal_external",
      value: 2,
      description: "Nation states are external but may recruit internal assets",
      realExample:
        "Russian intelligence recruited Dutch chemical weapons expert. Chinese intelligence cultivated assets at US defense contractors. North Korean IT workers infiltrate companies as employees.",
      strength: "medium",
      color: NODE_COLORS.attribute,
    },
  ],
};

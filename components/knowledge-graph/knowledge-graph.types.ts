"use client";

export type NodeType = string;
export type LinkStrength = "high" | "medium" | "low";

export interface Node {
  id: string;
  group: string;
  type: NodeType;
  label: string;
  description: string;
  examples: string[];
  color: string;
  weight: number;
  contentId: string;
}

export interface Link {
  source: string | Node;
  target: string | Node;
  value: number;
  description: string;
  realExample: string;
  strength: LinkStrength;
  color: string;
}

export interface GraphData {
  nodes: Node[];
  links: Link[];
}

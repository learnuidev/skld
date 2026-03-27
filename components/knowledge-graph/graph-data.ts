"use client";

type NodeColors =
  | "mutedMauve"
  | "deepSeaTeal"
  | "warmSandalwood"
  | "dustyRose"
  | "sageGreen"
  | "terracotta"
  | "slateBlue"
  | "goldenOchre"
  | "charcoalGray"
  | "cream"
  | "forestGreen"
  | "burgundy";

const NODE_COLORS: Record<NodeColors, string> = {
  mutedMauve: "#9B6B7C", // Muted Mauve - refined and subtle
  deepSeaTeal: "#4A7A7C", // Deep Sea Teal - sophisticated depth
  warmSandalwood: "#C4A27A", // Warm Sandalwood - organic luxury
  dustyRose: "#D4A5A5", // Dusty Rose - soft and romantic
  sageGreen: "#9CAF88", // Sage Green - natural and calming
  terracotta: "#C97C5D", // Terracotta - earthy and warm
  slateBlue: "#6A7A8E", // Slate Blue - calm and稳重
  goldenOchre: "#C69C6D", // Golden Ochre - rich and warm
  charcoalGray: "#4A4A4A", // Charcoal Gray - neutral and grounding
  cream: "#F5E6D3", // Cream - soft and light
  forestGreen: "#2C5F2D", // Forest Green - deep and lush
  burgundy: "#8B3A3A", // Burgundy - rich and dramatic
};

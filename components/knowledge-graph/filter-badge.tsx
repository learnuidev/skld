"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { Node } from "./knowledge-graph.types";

export const FilterBadge = ({
  activeNode,
  onReset,
}: {
  activeNode: Node | null;
  onReset: () => void;
}) => (
  <AnimatePresence>
    {activeNode && (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="absolute top-32 right-4 z-20"
      >
        <div className="inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg shadow-emerald-500/30 border border-emerald-400/30">
          <span>Filtering: {activeNode.label}</span>
          <button
            onClick={onReset}
            className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

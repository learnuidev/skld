"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Info, X } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Link } from "./knowledge-graph.types";

export const RelationshipPanel = ({
  link,
  onClose,
}: {
  link: Link | null;
  onClose: () => void;
}) => (
  <AnimatePresence>
    {link && (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="absolute bottom-4 right-4 z-30"
      >
        <Card
          className="bg-slate-900/98 backdrop-blur-xl border-l-4 shadow-2xl max-w-md"
          style={{ borderLeftColor: link.color }}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                Relationship Details
              </h3>
              <button
                onClick={onClose}
                className="hover:bg-slate-700 rounded-full p-1 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-slate-700/50">
              <p className="text-slate-200 text-sm leading-relaxed">
                {link.description}
              </p>
            </div>
            <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-r-lg p-4">
              <h4 className="text-emerald-400 font-semibold text-sm mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Real-World Example
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                {link.realExample}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: link.color }}
              >
                {link.strength.toUpperCase()}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )}
  </AnimatePresence>
);

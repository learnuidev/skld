"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Edit, GripVertical, Info, Search, X } from "lucide-react";
import { useTheme } from "next-themes";

import { Card, CardContent } from "@/components/ui/card";
import { PANEL_DARK_BACKGROUND } from "./knowledge-graph.constants";
import { Link } from "./knowledge-graph.types";

export const RelationshipPanel = ({
  link,
  onClose,
  isEditing = false,
  onEditLink,
}: {
  link: Link | null;
  onClose: () => void;
  isEditing?: boolean;
  onEditLink?: (link: Link) => void;
}) => {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === "dark" || resolvedTheme === "dark";

  return (
    <AnimatePresence>
      {link && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="absolute bottom-4 left-4 z-30 w-full max-w-md"
        >
          <motion.div
            drag
            dragMomentum={false}
            dragElastic={0}
            whileDrag={{ scale: 1.02, cursor: "grabbing" }}
            className="cursor-grab"
          >
            <Card
              className={`${isDark ? `${PANEL_DARK_BACKGROUND} backdrop-blur-xl border-slate-800/50` : "bg-white/98 backdrop-blur-xl border-slate-200/50"} shadow-xl`}
              style={{ borderLeftColor: link.color }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <GripVertical
                      className={`w-4 h-4 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                    />
                    <h3
                      className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                    >
                      Relationship Details
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    {isEditing && onEditLink && (
                      <button
                        onClick={() => onEditLink(link)}
                        className={`hover:${isDark ? "bg-slate-700/50" : "bg-slate-200/50"} rounded-lg p-2 transition-colors`}
                      >
                        <Edit
                          className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
                        />
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className={`hover:${isDark ? "bg-slate-700/50" : "bg-slate-200/50"} rounded-lg p-2 transition-colors`}
                    >
                      <X
                        className={`w-4 h-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                      />
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div
                    className={`${isDark ? "bg-slate-800/30" : "bg-slate-100/30 "} rounded-lg p-2`}
                  >
                    <p
                      className={`${isDark ? "text-slate-200" : "text-slate-700"} leading-relaxed text-xs`}
                    >
                      {link.description}
                    </p>
                  </div>
                  <div
                    className={`${isDark ? "bg-slate-800/30 " : "bg-slate-100/30 "} rounded-lg p-2`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-emerald-400 font-medium text-sm flex items-center gap-3">
                        <Info className="w-4 h-4" />
                        Real-World Example
                      </h4>
                      <button
                        onClick={() =>
                          window.open(
                            `https://www.google.com/search?q=${encodeURIComponent(
                              link.realExample
                            )}`,
                            "_blank"
                          )
                        }
                        className={`flex items-center gap-1 text-xs font-medium ${
                          isDark
                            ? "text-emerald-400 hover:text-emerald-300"
                            : "text-emerald-600 hover:text-emerald-500"
                        } transition-colors`}
                        title="Search on Google"
                      >
                        <Search className="w-3 h-3" />
                        <span>Search</span>
                      </button>
                    </div>
                    <p
                      className={`${isDark ? "text-slate-300" : "text-slate-600"} text-xs`}
                    >
                      {link.realExample}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex text-xs items-center px-3 py-1 rounded-full font-medium text-white"
                      style={{ backgroundColor: link.color }}
                    >
                      {link.strength.toUpperCase()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

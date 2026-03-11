"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Network, Target, Minimize2, Maximize2 } from "lucide-react";
import { useTheme } from "next-themes";

const LegendItem = ({
  color,
  label,
  count,
  isDark,
}: {
  color: string;
  label: string;
  count: number;
  isDark: boolean;
}) => (
  <div className="flex items-center gap-2 py-1">
    <div
      className={`w-2 h-2 rounded-full ring-2 ${isDark ? "ring-white/5" : "ring-black/5"}`}
      style={{ backgroundColor: color }}
    />
    <span className={`text-xs ${isDark ? "text-slate-200" : "text-slate-700"}`}>
      {label}
      <span className={`ml-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
        ({count})
      </span>
    </span>
  </div>
);

export const SidePanel = ({
  totalNodes,
  actorCount,
  attributeCount,
  motivationCount,
  linkCount,
}: {
  totalNodes: number;
  actorCount: number;
  attributeCount: number;
  motivationCount: number;
  linkCount: number;
}) => {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === "dark" || resolvedTheme === "dark";
  const [isMinimized, setIsMinimized] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className={`w-80 absolute z-10 transition-all duration-300 ${isMinimized ? "top-4 right-4" : "top-4 bottom-4 right-4"}`}
    >
      <Card
        className={`${isDark ? "bg-[rgb(13,14,15)] backdrop-blur-xl border-slate-800/50" : "bg-white/95 backdrop-blur-xl border-slate-200/50"} shadow-xl ${isMinimized ? "" : ""}`}
      >
        <CardContent
          className={`p-6 ${isMinimized ? "py-3" : "h-full flex flex-col"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`font-medium text-sm flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}
            >
              <Network className="w-3 h-3" />
              Overview
            </h3>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className={`hover:${isDark ? "bg-slate-700/50" : "bg-slate-200/50"} rounded p-1 transition-colors`}
            >
              {isMinimized ? (
                <Maximize2
                  className={`w-3 h-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                />
              ) : (
                <Minimize2
                  className={`w-3 h-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                />
              )}
            </button>
          </div>

          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-y-auto"
              >
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-light text-emerald-400 mb-1">
                      {totalNodes}
                    </div>
                    <div
                      className={`text-[10px] uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}
                    >
                      Total Concepts
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-600/30 to-transparent" />
                    <LegendItem
                      color="#FF6B6B"
                      label="Threat Actors"
                      count={actorCount}
                      isDark={isDark}
                    />
                    <LegendItem
                      color="#4ECDC4"
                      label="Attributes"
                      count={attributeCount}
                      isDark={isDark}
                    />
                    <LegendItem
                      color="#FFD93D"
                      label="Motivations"
                      count={motivationCount}
                      isDark={isDark}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-600/30 to-transparent" />
                    <div
                      className={`text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}
                    >
                      <span className="text-emerald-400 font-medium">
                        {linkCount} relationships
                      </span>{" "}
                      mapped
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-600/30 to-transparent" />
                    <div
                      className={`flex items-center gap-2 text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      <Target className="w-3 h-3 text-emerald-400" />
                      <span>Click any node to filter</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      <Info className="w-3 h-3 text-amber-400" />
                      <span>Click any link for examples</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

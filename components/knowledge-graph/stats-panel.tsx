"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

export const StatsPanel = ({
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="absolute top-4 right-4 z-10"
    >
      <Card className={`${isDark ? "bg-slate-900/95 backdrop-blur-xl" : "bg-white/95 backdrop-blur-xl"} shadow-2xl`}>
        <CardContent className="p-5 text-center min-w-[200px]">
          <div className="text-4xl font-bold text-emerald-400 mb-1">
            {totalNodes}
          </div>
          <div className={`text-xs uppercase tracking-wider mb-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Total Concepts
          </div>
          <div className="flex justify-around text-sm mb-3">
            <div>
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1.5" />
              <span className={isDark ? "text-slate-300" : "text-slate-700"}>{actorCount}</span>
            </div>
            <div>
              <span className="inline-block w-2 h-2 rounded-full bg-teal-400 mr-1.5" />
              <span className={isDark ? "text-slate-300" : "text-slate-700"}>{attributeCount}</span>
            </div>
            <div>
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1.5" />
              <span className={isDark ? "text-slate-300" : "text-slate-700"}>{motivationCount}</span>
            </div>
          </div>
          <div className={`h-px my-3 ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
          <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <span className="text-emerald-400 font-medium">
              {linkCount} relationships
            </span>{" "}
            mapped
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Info, Network, Target } from "lucide-react";
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
  <div className="flex items-center gap-3">
    <div
      className={`w-5 h-5 rounded-full shadow-lg ring-2 ${isDark ? "ring-white/10" : "ring-black/10"}`}
      style={{ backgroundColor: color }}
    />
    <span className={`text-sm ${isDark ? "text-slate-200" : "text-slate-700"}`}>
      <span className="font-semibold">{label}</span> ({count})
    </span>
  </div>
);

export const Legend = () => {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === "dark" || resolvedTheme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="absolute bottom-20 left-4 z-10"
    >
      <Card className={`${isDark ? "bg-slate-900/95 backdrop-blur-xl border-slate-700/50" : "bg-white/95 backdrop-blur-xl border-slate-200/50"} shadow-2xl`}>
        <CardContent className="p-5">
          <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
            <Network className="w-5 h-5" />
            Legend
          </h3>
          <div className="space-y-3">
            <LegendItem color="#FF6B6B" label="Threat Actors" count={7} isDark={isDark} />
            <LegendItem color="#4ECDC4" label="Attributes" count={3} isDark={isDark} />
            <LegendItem color="#FFD93D" label="Motivations" count={11} isDark={isDark} />
          </div>
          <div className={`mt-5 pt-4 border-t ${isDark ? "border-slate-700" : "border-slate-200"} space-y-2 text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            <div className="flex items-center gap-2">
              <Target className="w-3 h-3 text-emerald-400" />
              <span>Click any node to filter</span>
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-3 h-3 text-amber-400" />
              <span>Click any link for examples</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

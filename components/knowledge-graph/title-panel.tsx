"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Network } from "lucide-react";
import { useTheme } from "next-themes";

export const TitlePanel = () => {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === "dark" || resolvedTheme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="absolute top-4 left-4 z-10"
    >
      <Card className={`${isDark ? "bg-slate-900/95 backdrop-blur-xl" : "bg-white/95 backdrop-blur-xl"} border-l-4 border-emerald-500 shadow-2xl`}>
        <CardContent className="p-5">
          <h1 className={`text-2xl font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
            Threat Actors, Attributes & Motivations
          </h1>
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            CompTIA Security+ | Domain 2.1 | Real-World Examples
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1.5 text-xs font-medium text-emerald-400">
            <Network className="w-3 h-3" />
            <span>37 relationships with real examples</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

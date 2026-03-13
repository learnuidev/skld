"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

interface TitlePanelProps {
  title: string;
  description?: string;
}

export const TitlePanel = ({ title, description }: TitlePanelProps) => {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === "dark" || resolvedTheme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="absolute top-4 left-4 z-10"
    >
      <div>
        <h1 className={`text-xl font-light`}>{title}</h1>
        {description && (
          <p
            className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
};

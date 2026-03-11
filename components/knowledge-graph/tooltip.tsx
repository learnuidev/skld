"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";

import { Card, CardContent } from "@/components/ui/card";

export const Tooltip = ({
  content,
  position,
  visible,
}: {
  content: string;
  position: { x: number; y: number };
  visible: boolean;
}) => {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === "dark" || resolvedTheme === "dark";

  return (
    <AnimatePresence>
      {visible && content && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed z-50 pointer-events-none"
          style={{ left: position.x + 15, top: position.y - 10 }}
        >
          <Card className={`${isDark ? "bg-slate-900/95 border-slate-700/50" : "bg-white/95 border-slate-200/50"} backdrop-blur-xl shadow-2xl max-w-sm`}>
            <CardContent className="p-3">
              <p
                className={`text-sm leading-relaxed ${isDark ? "text-slate-200" : "text-slate-700"}`}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

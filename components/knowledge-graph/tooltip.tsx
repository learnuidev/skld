"use client";

import { AnimatePresence, motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";

export const Tooltip = ({
  content,
  position,
  visible,
}: {
  content: string;
  position: { x: number; y: number };
  visible: boolean;
}) => (
  <AnimatePresence>
    {visible && content && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="fixed z-50 pointer-events-none"
        style={{ left: position.x + 15, top: position.y - 10 }}
      >
        <Card className="bg-slate-900/95 backdrop-blur-xl border-slate-700/50 shadow-2xl max-w-sm">
          <CardContent className="p-3">
            <p
              className="text-sm text-slate-200 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </CardContent>
        </Card>
      </motion.div>
    )}
  </AnimatePresence>
);

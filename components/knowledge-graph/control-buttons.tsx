"use client";

import { motion } from "framer-motion";
import { X, ZoomIn } from "lucide-react";

import { Button } from "@/components/ui/button";

export const ControlButtons = ({
  onCenter,
  onResetFilter,
  hasFilter,
}: {
  onCenter: () => void;
  onResetFilter: () => void;
  hasFilter: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="absolute bottom-4 right-4 z-20 flex flex-col gap-2"
  >
    {hasFilter && (
      <Button
        onClick={onResetFilter}
        variant="destructive"
        size="sm"
        className="shadow-lg"
      >
        <X className="w-4 h-4 mr-2" />
        Reset Filter
      </Button>
    )}
    <Button
      onClick={onCenter}
      size="sm"
      className="shadow-lg bg-emerald-600 hover:bg-emerald-700"
    >
      <ZoomIn className="w-4 h-4 mr-2" />
      Center View
    </Button>
  </motion.div>
);

"use client";

import { motion } from "framer-motion";
import { X, ZoomIn } from "lucide-react";

import { Button } from "@/components/ui/button";

export const ControlButtons = ({
  onResetFilter,
  hasFilter,
}: {
  onResetFilter: () => void;
  hasFilter: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="absolute bottom-4 right-4 z-20 flex flex-row gap-2"
  >
    {hasFilter && (
      <Button
        onClick={onResetFilter}
        variant="ghost"
        size="sm"
        className="shadow-lg"
      >
        <X className="w-4 h-4 mr-2" />
        Reset Filter
      </Button>
    )}
  </motion.div>
);

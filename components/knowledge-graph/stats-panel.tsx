"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

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
}) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="absolute top-4 right-4 z-10"
  >
    <Card className="bg-slate-900/95 backdrop-blur-xl shadow-2xl">
      <CardContent className="p-5 text-center min-w-[200px]">
        <div className="text-4xl font-bold text-emerald-400 mb-1">
          {totalNodes}
        </div>
        <div className="text-xs text-slate-400 uppercase tracking-wider mb-3">
          Total Concepts
        </div>
        <div className="flex justify-around text-sm mb-3">
          <div>
            <span className="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1.5" />
            <span className="text-slate-300">{actorCount}</span>
          </div>
          <div>
            <span className="inline-block w-2 h-2 rounded-full bg-teal-400 mr-1.5" />
            <span className="text-slate-300">{attributeCount}</span>
          </div>
          <div>
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1.5" />
            <span className="text-slate-300">{motivationCount}</span>
          </div>
        </div>
        <div className="h-px bg-slate-700 my-3" />
        <div className="text-xs text-slate-400">
          <span className="text-emerald-400 font-medium">
            {linkCount} relationships
          </span>{" "}
          mapped
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

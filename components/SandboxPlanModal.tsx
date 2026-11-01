"use client";

import { motion } from "framer-motion";
import SandboxPlanCard from "./SandboxPlanCard";

export default function SandboxPlanModal({ fileName, onRun, onClose }: {
  fileName: string; onRun: () => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 backdrop-blur-md"
        style={{ background: "rgba(4,14,26,0.8)" }}
        onClick={onClose}
      />
      <div className="relative">
        <SandboxPlanCard fileName={fileName} onRun={onRun} onCancel={onClose} />
      </div>
    </div>
  );
}

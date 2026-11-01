"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowUpRight } from "lucide-react";

export default function ReportReadyCard({ fileName }: { fileName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-w-[460px] rounded-2xl px-5 py-4 flex items-center gap-3.5"
      style={{ background: "#FFFFFF", boxShadow: "0 14px 40px rgba(15,15,15,0.16), 0 2px 8px rgba(15,15,15,0.06)" }}
    >
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#DCFCE7" }}>
        <CheckCircle2 size={18} style={{ color: "#15803D" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold truncate" style={{ color: "#15171A" }}>Report ready</p>
        <p className="text-[12px] truncate" style={{ color: "#9CA0A6" }}>
          0 critical findings · delivered to host/reports/
        </p>
      </div>
      <span className="flex items-center gap-1 text-[12px] font-semibold flex-shrink-0" style={{ color: "#15171A" }}>
        View <ArrowUpRight size={13} />
      </span>
    </motion.div>
  );
}

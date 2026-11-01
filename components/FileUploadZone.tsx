"use client";

import { useCallback, useState, useRef } from "react";
import {
  Upload,
  FileCode,
  FileText,
  Package,
  AlertCircle,
  X,
  CheckCircle2,
} from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  disabled?: boolean;
}

const FILE_ICONS: Record<string, React.ReactNode> = {
  ".py": <FileCode size={20} className="text-blue-400" />,
  ".js": <FileCode size={20} className="text-yellow-400" />,
  ".ts": <FileCode size={20} className="text-blue-500" />,
  ".java": <FileCode size={20} className="text-orange-400" />,
  ".go": <FileCode size={20} className="text-cyan-400" />,
  ".php": <FileCode size={20} className="text-purple-400" />,
  ".json": <FileText size={20} className="text-green-400" />,
  ".yaml": <FileText size={20} className="text-pink-400" />,
  ".zip": <Package size={20} className="text-amber-400" />,
};

export function FileUploadZone({
  onFileSelect,
  selectedFile,
  onClear,
  disabled,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const getExt = (name: string) =>
    name.includes(".") ? "." + name.split(".").pop()!.toLowerCase() : "";

  const getFileIcon = (name: string) => {
    const ext = getExt(name);
    return FILE_ICONS[ext] ?? <FileText size={20} className="text-slate-400" />;
  };

  const handleFile = useCallback(
    (file: File) => {
      setDragError("");
      if (file.size > 50 * 1024 * 1024) {
        setDragError("File exceeds 50 MB limit.");
        return;
      }
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  if (selectedFile) {
    return (
      <div className="animate-fade-in-up">
        <div className="relative rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 flex items-center gap-4 glow-green">
          {/* File icon */}
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            {getFileIcon(selectedFile.name)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-mono text-sm font-medium text-foreground truncate">
              {selectedFile.name}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-muted-foreground font-mono">
                {formatBytes(selectedFile.size)}
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span className="text-xs text-muted-foreground font-mono uppercase">
                {getExt(selectedFile.name).replace(".", "") || "unknown"}
              </span>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span className="text-xs text-emerald-400 font-mono">Ready</span>
          </div>

          {/* Clear */}
          {!disabled && (
            <button
              onClick={onClear}
              className="ml-2 p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={cn(
          "relative rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden",
          "border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5",
          isDragging && "drop-zone-active border-primary",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {/* Scan line effect when dragging */}
        {isDragging && (
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent scan-line pointer-events-none z-10" />
        )}

        <div className="py-12 px-6 flex flex-col items-center gap-4 text-center">
          {/* Icon */}
          <div
            className={cn(
              "w-16 h-16 rounded-2xl border flex items-center justify-center transition-all duration-300",
              isDragging
                ? "border-primary/50 bg-primary/10 scale-110"
                : "border-border bg-muted"
            )}
          >
            <Upload
              size={24}
              className={cn(
                "transition-colors duration-300",
                isDragging ? "text-primary" : "text-muted-foreground"
              )}
            />
          </div>

          <div>
            <p className="font-display font-semibold text-foreground text-lg">
              {isDragging ? "Drop to scan" : "Drop file or click to browse"}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Source code, configs, binaries — up to 50 MB
            </p>
          </div>

          {/* Supported types */}
          <div className="flex flex-wrap justify-center gap-1.5 max-w-sm">
            {[".py", ".js", ".ts", ".java", ".go", ".php", ".json", ".yaml", ".zip", "…"].map(
              (ext) => (
                <span
                  key={ext}
                  className="px-2 py-0.5 rounded text-xs font-mono bg-muted border border-border text-muted-foreground"
                >
                  {ext}
                </span>
              )
            )}
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={onInputChange}
          disabled={disabled}
        />
      </div>

      {dragError && (
        <div className="mt-2 flex items-center gap-2 text-destructive text-sm">
          <AlertCircle size={14} />
          <span>{dragError}</span>
        </div>
      )}
    </div>
  );
}

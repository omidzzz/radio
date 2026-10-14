interface ScanLineDividerProps {
  className?: string;
}

export default function ScanLineDivider({ className = "" }: ScanLineDividerProps) {
  return (
    <div className={`relative h-12 w-full overflow-hidden bg-deep ${className}`} aria-hidden="true">
      {/* Sweeping scan beam */}
      <div className="scan-line relative h-full w-full">
        <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
      </div>
      {/* Horizontal energy lines */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      {/* Center dose tick */}
      <div className="absolute left-1/2 top-1/2 h-1 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/50 blur-[1px]" />
    </div>
  );
}
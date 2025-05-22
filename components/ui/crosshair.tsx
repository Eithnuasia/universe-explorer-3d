"use client";

export function Crosshair() {
  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      <div className="relative w-16 h-16">
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Minimalist crosshair lines */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {/* Inner gap */}
          <div className="absolute top-1/2 left-[8px] w-[16px] h-px bg-cyan-400/80 transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-[8px] w-[16px] h-px bg-cyan-400/80 transform -translate-y-1/2"></div>
          <div className="absolute left-1/2 top-[8px] h-[16px] w-px bg-cyan-400/80 transform -translate-x-1/2"></div>
          <div className="absolute left-1/2 bottom-[8px] h-[16px] w-px bg-cyan-400/80 transform -translate-x-1/2"></div>
        </div>
        
        {/* Small corner indicators */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/60"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400/60"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400/60"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400/60"></div>
      </div>
    </div>
  );
}

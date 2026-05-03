import React from 'react';

export default function NeuCard({ children, className = "", pressed = false }: { children: React.ReactNode, className?: string, pressed?: boolean }) {
  // Soft UI shadows: standard extruded look vs inset pressed look
  const shadows = pressed 
    ? "shadow-[inset_6px_6px_12px_#a3b1c6,inset_-6px_-6px_12px_#ffffff]" 
    : "shadow-[6px_6px_12px_#a3b1c6,-6px_-6px_12px_#ffffff]";

  return (
    <div className={`bg-[#e0e5ec] rounded-2xl ${shadows} ${className}`}>
      {children}
    </div>
  );
}
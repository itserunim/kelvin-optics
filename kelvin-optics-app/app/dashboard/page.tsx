"use client";
import React from 'react';
import Link from 'next/link';
import { useWebSocket } from '@/lib/useWebSocket';
import NeuCard from '@/components/NeuCard';

export default function Dashboard() {
  // Replace with your ESP32 IP
  const { sensors, deviceStatus } = useWebSocket("192.168.x.x");

  return (
    <div className="min-h-screen bg-[#e0e5ec] text-slate-700 font-sans p-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
            <Link 
            href="/" 
            className="w-12 h-12 flex items-center justify-center bg-[#e0e5ec] rounded-full shadow-[6px_6px_12px_#a3b1c6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] transition-all text-slate-500 hover:text-slate-700 focus:outline-none"
            aria-label="Go back to home"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-500 tracking-tight drop-shadow-sm">
                Dashboard
            </h1>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        <NeuCard className="p-8 flex flex-col items-center justify-center text-center">
          <h2 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-4">Temperature</h2>
          <p className="text-6xl font-extrabold text-orange-500 drop-shadow-md">
            {sensors.temperature.toFixed(1)}°
          </p>
        </NeuCard>

        <NeuCard className="p-8 flex flex-col items-center justify-center text-center">
          <h2 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-4">Pressure</h2>
          <p className="text-5xl font-extrabold text-blue-500 drop-shadow-md">
            {sensors.pressure.toFixed(1)} <span className="text-2xl">hPa</span>
          </p>
        </NeuCard>

        <NeuCard className="p-6 md:col-span-2 flex justify-between items-center">
          <div>
            <h2 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">HUD Status</h2>
            <p className={`font-semibold ${deviceStatus.displayOn ? "text-green-500" : "text-red-400"}`}>
              {deviceStatus.displayOn ? "Active" : "Sleep Mode"}
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Active Slide</h2>
            <p className="font-bold text-slate-600 text-xl">
              {deviceStatus.currentSlide === 0 ? "Temp" : deviceStatus.currentSlide === 1 ? "Time" : "Pressure"}
            </p>
          </div>
        </NeuCard>
      </div>
    </div>
  );
}
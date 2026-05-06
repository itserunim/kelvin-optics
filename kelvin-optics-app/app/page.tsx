import Link from 'next/link';
import NeuCard from '@/components/NeuCard';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-lime-500 tracking-tight drop-shadow-sm mb-4">
          KELVIN OPTICS
        </h1>
        <p className="text-lime-300 font-medium tracking-wide">
          Select a system module to initialize
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">

        <Link href="/dashboard" className="block focus:outline-none outline-none">
          <NeuCard className="p-8 flex flex-col items-center justify-center text-center hover:scale-[1.02] transition-transform cursor-pointer h-full">
            <div className="w-16 h-16 rounded-full bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h2 className="text-xl font-bold text-lime-800 mb-2">Sensor Dashboard</h2>
            <p className="text-sm text-lime-700">Monitor live environmental data and HUD telemetry.</p>
          </NeuCard>
        </Link>

        <Link href="/chat" className="block focus:outline-none outline-none">
          <NeuCard className="p-8 flex flex-col items-center justify-center text-center hover:scale-[1.02] transition-transform cursor-pointer h-full">
            <div className="w-16 h-16 rounded-full bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center mb-4">
              <span className="text-2xl">🌐</span>
            </div>
            <h2 className="text-xl font-bold text-lime-800 mb-2">World Chat</h2>
            <p className="text-sm text-lime-700">Connect to the global network and broadcast messages.</p>
          </NeuCard>
        </Link>

      </div>
    </main>
  );
}
import React from 'react';

const WorkoutSuccess = ({ stats, onReturnHome }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center p-6 space-y-8 animate-fade-in text-center bg-[#0a0a0a] fixed inset-0 z-50">
            {/* Headline */}
            <div className="space-y-0 transform -rotate-3">
                <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic leading-none">
                    Ottimo
                </h1>
                <h1 className="text-6xl font-black text-primary uppercase tracking-tighter italic leading-none">
                    Lavoro!
                </h1>
                <p className="text-white/40 font-medium tracking-widest uppercase text-xs mt-6 transform rotate-3">Session Complete</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 w-full gap-3 max-w-sm pt-8">
                {/* Duration */}
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex items-center justify-between">
                    <span className="text-white/40 font-bold uppercase text-xs tracking-wider">Duration</span>
                    <span className="text-2xl font-black text-white font-mono">{stats.time}</span>
                </div>
                {/* Volume */}
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex items-center justify-between">
                    <span className="text-white/40 font-bold uppercase text-xs tracking-wider">Vol (kg)</span>
                    <span className="text-2xl font-black text-white font-mono">{Math.round(stats.volume).toLocaleString()}</span>
                </div>
                {/* Sets */}
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex items-center justify-between">
                    <span className="text-white/40 font-bold uppercase text-xs tracking-wider">Sets</span>
                    <span className="text-2xl font-black text-white font-mono">{stats.sets}</span>
                </div>
            </div>

            {/* Action */}
            <div className="absolute bottom-10 left-6 right-6">
                <button
                    onClick={onReturnHome}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-[0_4px_20px_rgba(0,46,93,0.5)] active:scale-95 transition-all outline-none"
                >
                    Return to Hub
                </button>
            </div>
        </div>
    );
};

export default WorkoutSuccess;

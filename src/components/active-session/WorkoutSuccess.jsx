import React, { useState } from 'react';
import { MessageSquare, Share } from 'lucide-react';

const WorkoutSuccess = ({ stats, onReturnHome }) => {
    const [rpe, setRpe] = useState(5);
    const [notes, setNotes] = useState('');

    return (
        <div className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col overflow-y-auto">
            {/* Ambient Glow */}
            <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="flex-1 flex flex-col items-center p-6 pb-4 animate-fade-in text-center max-w-md mx-auto w-full">

                {/* Headline & Streak */}
                <div className="mt-8 space-y-2">
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1 rounded-full mb-6">
                        <span className="text-orange-500 text-xs">🔥</span>
                        <span className="text-white/60 text-xs font-bold uppercase tracking-wider">3 Day Streak</span>
                    </div>

                    <div className="transform -rotate-3 space-y-0">
                        <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic leading-none">
                            Ottimo
                        </h1>
                        <h1 className="text-6xl font-black text-primary uppercase tracking-tighter italic leading-none">
                            Lavoro!
                        </h1>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 w-full gap-2 mt-12 mb-8">
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-1">
                        <span className="text-white/40 font-bold uppercase text-[10px] tracking-wider">Duration</span>
                        <span className="text-lg font-black text-white font-mono">{stats.time}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-1">
                        <span className="text-white/40 font-bold uppercase text-[10px] tracking-wider">Vol (kg)</span>
                        <span className="text-lg font-black text-white font-mono">{Math.round(stats.volume).toLocaleString()}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-1">
                        <span className="text-white/40 font-bold uppercase text-[10px] tracking-wider">Sets</span>
                        <span className="text-lg font-black text-white font-mono">{stats.sets}</span>
                    </div>
                </div>

                {/* Debrief Section */}
                <div className="w-full space-y-8 bg-white/5 p-6 rounded-3xl border border-white/10">

                    {/* RPE Slider */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-white font-bold text-sm">Session Intensity (RPE)</label>
                            <span className="text-primary font-black text-xl">{rpe}</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            step="1"
                            value={rpe}
                            onChange={(e) => setRpe(parseInt(e.target.value))}
                            className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-[10px] text-white/20 font-bold uppercase tracking-wider">
                            <span>Easy</span>
                            <span>Moderate</span>
                            <span>Max Effort</span>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-3 text-left">
                        <label className="text-white font-bold text-sm flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-white/40" />
                            Session Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="How did it feel? Any pain points?"
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/20 focus:border-primary focus:outline-none min-h-[100px] resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* INLINE Footer Action */}
            <div className="w-full pt-0 pb-40 space-y-3 relative z-10 flex flex-col items-center">
                <button
                    onClick={() => {
                        // TODO: Save rpe/notes to history
                        onReturnHome();
                    }}
                    className="w-full max-w-[85%] py-4 bg-primary text-white rounded-full font-bold text-lg shadow-[0_4px_20px_rgba(0,46,93,0.5)] active:scale-95 transition-all outline-none"
                >
                    Complete Log
                </button>

                <button
                    className="w-full max-w-[85%] py-4 bg-white/5 hover:bg-white/10 border border-white/5 text-white/40 font-bold text-sm flex items-center justify-center gap-2 transition-colors active:scale-95 rounded-full"
                >
                    <Share className="w-4 h-4" />
                    Share Workout
                </button>
            </div>
        </div>
    );
};

export default WorkoutSuccess;

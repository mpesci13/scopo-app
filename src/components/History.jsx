import React, { useMemo, useState } from 'react';
import { Clock, Dumbbell, Calendar, MessageSquare, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

const History = () => {
    const { sessions } = useWorkout();
    const [selectedSession, setSelectedSession] = useState(null);

    // Sort sessions: Newest first
    const sortedSessions = useMemo(() => {
        return [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [sessions]);

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(date);
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
    };

    const getRpeColor = (rpe) => {
        if (!rpe) return 'bg-white/5 text-white/50 border-white/10';
        if (rpe >= 9) return 'bg-red-500/20 text-red-400 border-red-500/30';
        if (rpe >= 7) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        return 'bg-green-500/20 text-green-400 border-green-500/30';
    };

    // --- Drill Down View ---
    if (selectedSession) {
        return (
            <div className="h-full flex flex-col bg-[#0a0a0a] text-white animate-fade-in relative">
                {/* Header Profile */}
                <div className="sticky top-0 z-20 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => setSelectedSession(null)}
                        className="p-2 -ml-2 text-white/60 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                        <h2 className="text-lg font-bold text-white tracking-tight leading-none">Workout Details</h2>
                        <span className="text-xs text-white/40 font-mono uppercase tracking-wider">{formatDate(selectedSession.date)}</span>
                    </div>
                    <div className="w-10" /> {/* Spacer */}
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 pb-24">

                    {/* Top Stats Hero */}
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6">
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-1">
                                    {selectedSession.name || 'Workout'}
                                </h1>
                                <div className="flex items-center gap-2 text-white/40 text-xs font-mono uppercase tracking-widest">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatTime(selectedSession.date)}</span>
                                </div>
                            </div>

                            {selectedSession.rpe > 0 && (
                                <div className={`px-3 py-1.5 rounded-lg border text-xs font-black uppercase tracking-wider ${getRpeColor(selectedSession.rpe)}`}>
                                    RPE {selectedSession.rpe}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-black/40 rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5">
                                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Time</span>
                                <span className="font-mono font-bold text-lg text-white">{selectedSession.duration}</span>
                            </div>
                            <div className="bg-black/40 rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5">
                                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Volume</span>
                                <span className="font-mono font-bold text-lg text-white">{(selectedSession.volume / 1000).toFixed(1)}k</span>
                            </div>
                            <div className="bg-black/40 rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5">
                                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Sets</span>
                                <span className="font-mono font-bold text-lg text-white">{selectedSession.totalSets}</span>
                            </div>
                        </div>

                        {selectedSession.notes && (
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-1.5 mb-2">
                                    <MessageSquare className="w-3 h-3" />
                                    Session Notes
                                </label>
                                <p className="text-sm text-white/80 leading-relaxed italic">"{selectedSession.notes}"</p>
                            </div>
                        )}
                    </div>

                    {/* Exercise Breakdown */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest px-2">Exercises</h3>

                        <div className="space-y-3">
                            {selectedSession.exercises.map((ex, idx) => (
                                <div key={ex.id || idx} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-white text-lg">{ex.name}</h4>
                                        <span className="text-xs text-white/40 font-mono">{ex.sets.filter(s => s.completed).length} Sets</span>
                                    </div>

                                    <div className="space-y-2">
                                        {/* Table Header */}
                                        <div className="grid grid-cols-4 gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 mb-1">
                                            <div className="text-center">Set</div>
                                            <div className="text-center">lbs</div>
                                            <div className="text-center">Reps</div>
                                            <div className="text-center text-primary/60">RPE</div>
                                        </div>

                                        {/* Sets */}
                                        {ex.sets.map((set, sIdx) => (
                                            <div
                                                key={set.id || sIdx}
                                                className={`grid grid-cols-4 gap-2 px-2 py-2 rounded-lg items-center ${set.completed ? 'bg-black/40 border border-white/5' : 'opacity-30'}`}
                                            >
                                                <div className="text-center text-xs font-mono text-white/40">{sIdx + 1}</div>
                                                <div className="text-center font-mono font-bold">{set.weight || '-'}</div>
                                                <div className="text-center font-mono font-bold">{set.reps || '-'}</div>
                                                <div className="text-center font-mono text-primary/80">{set.rpe || '-'}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        );
    }

    // --- Main List View ---
    return (
        <div className="h-full flex flex-col bg-[#0a0a0a] text-white animate-fade-in relative z-10">
            <div className="px-6 py-8 pb-4">
                <h1 className="text-3xl font-black italic tracking-tighter uppercase relative z-20">
                    History
                </h1>
                <p className="text-white/40 text-sm relative z-20">Your training timeline</p>

                {/* Background wash */}
                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none z-10"></div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-3">
                {sortedSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 opacity-50 mt-10">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                            <Dumbbell className="w-8 h-8 text-white/20" />
                        </div>
                        <p className="text-sm font-medium">No workouts recorded yet.</p>
                        <p className="text-xs text-white/50">Your completed sessions will appear here.</p>
                    </div>
                ) : (
                    sortedSessions.map(session => (
                        <button
                            key={session.id}
                            onClick={() => setSelectedSession(session)}
                            className="w-full text-left bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden group hover:bg-white/10 transition-colors active:scale-[0.98]"
                        >
                            {/* Header row */}
                            <div className="flex justify-between items-start w-full">
                                <div>
                                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{session.name || 'Workout'}</h3>
                                    <div className="flex items-center gap-1.5 text-white/40 text-[10px] mt-1 font-mono uppercase tracking-wider">
                                        <Calendar className="w-3 h-3" />
                                        <span>{formatDate(session.date)}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors group-hover:translate-x-1" />
                                    {session.rpe > 0 && (
                                        <div className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider ${getRpeColor(session.rpe)}`}>
                                            RPE {session.rpe}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Stats mini-grid */}
                            <div className="flex items-center gap-4 text-sm font-mono text-white/60">
                                <span>{session.duration}</span>
                                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                <span>{(session.volume / 1000).toFixed(1)}k lbs</span>
                                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                <span>{session.totalSets} sets</span>
                            </div>

                            {/* Exercises Preview */}
                            <div className="flex flex-wrap gap-1.5 mt-1">
                                {session.exercises.slice(0, 3).map((ex, i) => (
                                    <span key={i} className="text-[10px] bg-black/40 px-2 py-1 rounded-md text-white/50 border border-white/5 whitespace-nowrap">
                                        {ex.name}
                                    </span>
                                ))}
                                {session.exercises.length > 3 && (
                                    <span className="text-[10px] px-2 py-1 text-white/30 italic">
                                        +{session.exercises.length - 3} more
                                    </span>
                                )}
                            </div>

                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

export default History;

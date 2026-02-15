import React, { useMemo } from 'react';
import { Clock, Dumbbell, Calendar, MessageSquare, ChevronRight } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

const History = () => {
    const { sessions } = useWorkout();

    console.log('History component rendering. Sessions:', sessions);

    // Sort sessions: Newest first
    const sortedSessions = useMemo(() => {
        return [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [sessions]);

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
    };

    const getRpeColor = (rpe) => {
        if (rpe >= 9) return 'bg-red-500 text-white';
        if (rpe >= 7) return 'bg-yellow-500 text-black';
        return 'bg-green-500 text-black';
    };

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a] text-white animate-fade-in">
            <div className="px-6 py-8 pb-4">
                <h1 className="text-3xl font-black italic tracking-tighter uppercase">
                    History
                </h1>
                <p className="text-white/40 text-sm">Your workout log</p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-4">
                {sortedSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 opacity-50">
                        <Dumbbell className="w-12 h-12 text-white/20" />
                        <p className="text-sm">No workouts completed yet.</p>
                    </div>
                ) : (
                    sortedSessions.map(session => (
                        <div key={session.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 relative overflow-hidden group">
                            {/* Ambient Glow */}
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-primary/20 transition-all duration-500"></div>

                            {/* Header */}
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">{session.name || 'Workout'}</h3>
                                    <div className="flex items-center gap-2 text-white/40 text-xs mt-1 font-mono uppercase tracking-wider">
                                        <Calendar className="w-3 h-3" />
                                        <span>{formatDate(session.date)}</span>
                                    </div>
                                </div>
                                {session.rpe > 0 && (
                                    <div className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getRpeColor(session.rpe)}`}>
                                        RPE {session.rpe}
                                    </div>
                                )}
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-white/5">
                                <div className="text-center">
                                    <span className="block text-[10px] text-white/30 uppercase tracking-widest font-bold">Time</span>
                                    <span className="font-mono font-bold text-white">{session.duration}</span>
                                </div>
                                <div className="text-center border-l border-white/5">
                                    <span className="block text-[10px] text-white/30 uppercase tracking-widest font-bold">Vol</span>
                                    <span className="font-mono font-bold text-white">{(session.volume / 1000).toFixed(1)}k</span>
                                </div>
                                <div className="text-center border-l border-white/5">
                                    <span className="block text-[10px] text-white/30 uppercase tracking-widest font-bold">Sets</span>
                                    <span className="font-mono font-bold text-white">{session.totalSets}</span>
                                </div>
                            </div>

                            {/* Exercises Preview (Compact) */}
                            <div className="flex flex-wrap gap-1">
                                {session.exercises.slice(0, 3).map((ex, i) => (
                                    <span key={i} className="text-[10px] bg-white/5 px-2 py-1 rounded-full text-white/60 border border-white/5">
                                        {ex.name}
                                    </span>
                                ))}
                                {session.exercises.length > 3 && (
                                    <span className="text-[10px] px-2 py-1 text-white/40">
                                        +{session.exercises.length - 3} more
                                    </span>
                                )}
                            </div>

                            {/* Notes Snippet */}
                            {session.notes && (
                                <div className="flex items-start gap-2 text-white/50 text-xs italic bg-black/20 p-3 rounded-xl border border-white/5">
                                    <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                                    <p className="line-clamp-2">{session.notes}</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default History;

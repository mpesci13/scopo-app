import React, { useMemo } from 'react';
import { Activity, Dumbbell, Calendar, Zap, ArrowRight, Play } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

const Dashboard = ({ onStartWorkout }) => {
    const { sessions } = useWorkout();

    // 1. Calculations: Weekly Volume
    const currentWeekVolume = useMemo(() => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return sessions
            .filter(s => new Date(s.date) >= oneWeekAgo)
            .reduce((sum, s) => sum + (s.volume || 0), 0);
    }, [sessions]);

    // 2. Calculations: Active Streak (Simple: consecutive days with a workout)
    const activeStreak = useMemo(() => {
        if (!sessions || sessions.length === 0) return 0;

        const sortedDates = [...new Set(sessions.map(s =>
            new Date(s.date).toLocaleDateString()
        ))].sort((a, b) => new Date(b) - new Date(a));

        let streak = 0;
        const today = new Date().toLocaleDateString();
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

        // If neither today nor yesterday has a workout, streak is 0
        if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
            return 0;
        }

        let currentDate = new Date(sortedDates[0]);
        for (let i = 0; i < sortedDates.length; i++) {
            const dateStr = sortedDates[i];
            const expectedStr = currentDate.toLocaleDateString();

            if (dateStr === expectedStr) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    }, [sessions]);

    // 3. Recent Activity
    const mostRecentWorkout = useMemo(() => {
        if (!sessions || sessions.length === 0) return null;
        return [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    }, [sessions]);

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a] text-white animate-fade-in pb-24 relative overflow-y-auto">
            {/* Header / Greeting */}
            <div className="px-6 py-8 pb-6 relative z-10">
                <h1 className="text-3xl font-black italic tracking-tighter uppercase relative z-20">
                    Command
                    <br />
                    <span className="text-primary">Center</span>
                </h1>
                <p className="text-white/40 text-sm mt-1 relative z-20">Welcome back. Ready to work?</p>

                {/* Background wash */}
                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none z-10"></div>
            </div>

            <div className="px-4 space-y-6 flex-1 relative z-20">

                {/* Primary CTA */}
                <button
                    onClick={onStartWorkout}
                    className="w-full relative overflow-hidden bg-primary rounded-3xl p-6 flex items-center justify-between group active:scale-[0.98] transition-all shadow-[0_4px_24px_rgba(0,46,93,0.4)]"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 group-hover:bg-white/20 transition-colors"></div>
                    <div className="text-left relative z-10">
                        <h2 className="text-2xl font-black italic uppercase tracking-tight">Start Session</h2>
                        <p className="text-white/80 text-sm font-medium">Log a new workout</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center relative z-10">
                        <Play className="w-5 h-5 text-white ml-1" />
                    </div>
                </button>

                {/* Top Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col gap-2 relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-16 h-16 bg-orange-500/10 rounded-full blur-xl"></div>
                        <div className="flex items-center gap-2 text-white/40 mb-1">
                            <Zap className="w-4 h-4 text-orange-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Streak</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black italic tracking-tighter">{activeStreak}</span>
                            <span className="text-white/40 text-sm font-bold">Days</span>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col gap-2 relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
                        <div className="flex items-center gap-2 text-white/40 mb-1">
                            <Activity className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">7-Day Vol</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black italic tracking-tighter">{(currentWeekVolume / 1000).toFixed(1)}</span>
                            <span className="text-white/40 text-sm font-bold uppercase tracking-wider">k lbs</span>
                        </div>
                    </div>
                </div>

                {/* 7-Day Habit Tracker */}
                <div className="bg-white/5 border border-white/10 rounded-3xl py-4 px-2">
                    <div className="flex items-center justify-between px-3 mb-4">
                        <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            This Week
                        </h3>
                    </div>
                    <div className="flex justify-between px-2">
                        {(() => {
                            const days = [];
                            const today = new Date();

                            // Get unique dates that have sessions
                            const sessionDates = new Set(
                                sessions.map(s => new Date(s.date).toLocaleDateString())
                            );

                            for (let i = 6; i >= 0; i--) {
                                const d = new Date(today);
                                d.setDate(today.getDate() - i);

                                const isToday = i === 0;
                                const dateStr = d.toLocaleDateString();
                                const hasSession = sessionDates.has(dateStr);
                                const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' }); // M, T, W, etc.

                                days.push(
                                    <div key={i} className="flex flex-col items-center gap-2">
                                        <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-white' : 'text-white/40'}`}>
                                            {dayName}
                                        </span>
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${hasSession
                                                    ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_12px_rgba(0,46,93,0.5)]'
                                                    : 'bg-black/40 border border-white/5 text-white/20'
                                                } ${isToday && !hasSession ? 'ring-1 ring-white/20' : ''}`}
                                        >
                                            <span className="text-xs font-mono font-bold">
                                                {d.getDate()}
                                            </span>
                                        </div>
                                    </div>
                                );
                            }
                            return days;
                        })()}
                    </div>
                </div>

                {/* Recent Activity Widget */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">Recent Activity</h3>
                    </div>

                    {mostRecentWorkout ? (
                        <div className="bg-black/40 border border-white/10 rounded-3xl p-5 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{mostRecentWorkout.name || 'Workout'}</h4>
                                    <div className="flex items-center gap-1.5 text-white/40 text-[10px] mt-1 font-mono uppercase tracking-wider">
                                        <Calendar className="w-3 h-3" />
                                        <span>{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(mostRecentWorkout.date))}</span>
                                    </div>
                                </div>
                                {mostRecentWorkout.rpe > 0 && (
                                    <div className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider bg-white/5 border-white/10 text-white/60`}>
                                        RPE {mostRecentWorkout.rpe}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 text-sm font-mono text-white/60 mb-4">
                                <span>{mostRecentWorkout.duration}</span>
                                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                <span>{(mostRecentWorkout.volume / 1000).toFixed(1)}k lbs</span>
                                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                <span>{mostRecentWorkout.totalSets} sets</span>
                            </div>

                            <div className="flex flex-wrap gap-1.5 pt-4 border-t border-white/5">
                                {mostRecentWorkout.exercises.slice(0, 3).map((ex, i) => (
                                    <span key={i} className="text-[10px] bg-white/5 px-2 py-1 rounded-md text-white/60 border border-white/5 whitespace-nowrap">
                                        {ex.name}
                                    </span>
                                ))}
                                {mostRecentWorkout.exercises.length > 3 && (
                                    <span className="text-[10px] px-2 py-1 text-white/30 italic">
                                        +{mostRecentWorkout.exercises.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-black/40 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center opacity-70">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                                <Dumbbell className="w-5 h-5 text-white/40" />
                            </div>
                            <p className="text-sm font-bold text-white/80">No recent workouts</p>
                            <p className="text-xs text-white/40 mt-1">Your latest session will appear here</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Dashboard;

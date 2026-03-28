import React, { useMemo } from 'react';
import { ArrowLeft, Trophy, Ghost, Calendar, Activity, CheckCircle2, TrendingUp, Clock, Target, Dumbbell, Zap, Flame, Award, Quote } from 'lucide-react';
import { useWorkout } from '../../context/WorkoutContext';

const ChallengeSummary = ({ challenge, onBack }) => {
    const { sessions, logs } = useWorkout();
    const isAbandoned = challenge.status === 'abandoned';
    const goalType = challenge.goalType || 'custom';
    const participant = challenge.participants?.[0]; // Current user is index 0
    
    // Stats calculation
    const stats = useMemo(() => {
        if (!participant) return null;

        const start = new Date(challenge.duration.startDate);
        const end = new Date(challenge.duration.endDate);
        const diffMs = end.getTime() - start.getTime();
        const daysTotal = Math.max(1, Math.ceil(diffMs / 86400000));
        
        // 1. Mission Duration & Hit Count
        let hitsForDays = 0;
        let currentStreak = 0;
        let longestStreak = 0;
        
        // Count "Achieved Days" (at least one habit hit)
        // Count "Perfect Days" (all habits hit)
        let perfectDays = 0;

        for (let i = 0; i < daysTotal; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const dateStr = d.toLocaleDateString('en-US');
            const dayLogs = participant.dailyLogs?.[dateStr] || {};
            
            const totalRules = challenge.rules?.length || 0;
            const hitRules = Object.values(dayLogs).filter(v => v === true).length;
            
            if (hitRules > 0) hitsForDays++;
            
            if (hitRules > 0 && hitRules === totalRules && totalRules > 0) {
                perfectDays++;
                currentStreak++;
                longestStreak = Math.max(longestStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        }

        // 2. Volume & Performance (Lifting)
        const missionSessions = sessions.filter(s => {
            const sDate = new Date(s.date);
            return sDate >= start && sDate <= end;
        });
        const totalVolume = missionSessions.reduce((acc, s) => acc + (s.volume || 0), 0);
        const sessionsCount = missionSessions.length;

        // 3. PR Detector
        let prCount = 0;
        const missionLogs = logs.filter(l => {
            const lDate = new Date(l.date);
            return lDate >= start && lDate <= end;
        });

        // Simplified PR Detection: Compare every log in window against ALL logs before that date
        missionLogs.forEach(currentLog => {
            if (!currentLog.weight || currentLog.weight <= 0) return;
            
            const prevLogsForEx = logs.filter(l => 
                l.exercise === currentLog.exercise && 
                new Date(l.date) < new Date(currentLog.date)
            );
            
            if (prevLogsForEx.length === 0) return; // First time doing it isn't necessarily a "PR" in this context
            
            const maxPrev = Math.max(...prevLogsForEx.map(l => l.weight || 0));
            if (currentLog.weight > maxPrev) {
                prCount++;
            }
        });

        // 4. Habit breakdown
        let habitStats = [];
        if (challenge.rules && challenge.rules.length > 0) {
            habitStats = challenge.rules.map(rule => {
                let hits = 0;
                Object.values(participant.dailyLogs || {}).forEach(dayLog => {
                    if (dayLog[rule.id]) hits++;
                });
                return {
                    ...rule,
                    hits,
                    rate: Math.round((hits / daysTotal) * 100)
                };
            });
        }

        return {
            daysTotal,
            hitsForDays,
            perfectDays,
            longestStreak,
            totalVolume,
            sessionsCount,
            prCount,
            habitStats,
            overallRate: Math.round((perfectDays / daysTotal) * 100)
        };
    }, [challenge, participant, sessions, logs]);

    if (!stats) return null;

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a] text-white animate-fade-in relative z-50 overflow-hidden">
            {/* BACKGROUND DECORATIONS (Spotify Style) */}
            <div className={`absolute top-[-10%] left-[-10%] w-[120%] h-[40%] blur-[120px] opacity-20 pointer-events-none rounded-full ${
                isAbandoned ? 'bg-red-600' : 'bg-primary'
            }`}></div>
            
            {/* Header */}
            <div className="flex items-center gap-4 p-4 relative z-10 backdrop-blur-sm border-b border-white/5">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 text-white/60 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex-1">
                    <h2 className="text-xl font-black uppercase italic tracking-tighter">Your Mission Debrief</h2>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 relative z-10">
                
                {/* HERO: Status & Title */}
                <div className="text-center py-6">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-4 text-[10px] font-black tracking-[0.2em] uppercase ${
                        isAbandoned ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-primary/20 border-primary/40 text-primary'
                    }`}>
                        {isAbandoned ? <Ghost className="w-4 h-4" /> : <Award className="w-4 h-4" />}
                        Mission {isAbandoned ? 'Retired' : 'Completed'}
                    </div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2 text-white drop-shadow-2xl">
                        {challenge.title}
                    </h1>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                        {new Date(challenge.duration.startDate).toLocaleDateString()} — {new Date(challenge.duration.endDate).toLocaleDateString()}
                    </p>
                </div>

                {/* THE "CAPTAIN'S LOG" (Reflection) */}
                {(isAbandoned || challenge.status === 'completed') && (
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
                        <Quote className="absolute -top-2 -left-2 w-16 h-16 text-white/5 -rotate-12 pointer-events-none" />
                        <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-3 relative z-10">Captain's Log</h4>
                        <p className="text-lg font-bold italic text-white/80 leading-relaxed relative z-10">
                            "{challenge.reflection || (isAbandoned ? "Mission retired early—collecting data for the next attempt." : "Objective reached. Success archived.")}"
                        </p>
                    </div>
                )}

                {/* BIG STAT CARDS (Spotify Style) */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Days Achieved */}
                    <div className="bg-primary/20 border border-primary/30 rounded-3xl p-6 flex flex-col justify-between shadow-[0_0_30px_rgba(0,46,93,0.3)] min-h-[160px]">
                        <div>
                            <div className="bg-primary/20 p-2 rounded-xl w-fit mb-4">
                                <Target className="w-5 h-5 text-primary" />
                            </div>
                            <div className="text-4xl font-black italic tracking-tighter text-white">
                                {stats.hitsForDays}<span className="text-lg opacity-20">/{stats.daysTotal}</span>
                            </div>
                        </div>
                        <div className="text-[10px] font-black text-primary uppercase tracking-widest mt-auto">Days Achieved</div>
                    </div>

                    {/* Longest Streak (If custom/habit) */}
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-6 flex flex-col justify-between min-h-[160px]">
                        <div>
                            <div className="bg-orange-500/20 p-2 rounded-xl w-fit mb-4">
                                <Flame className="w-5 h-5 text-orange-500" />
                            </div>
                            <div className="text-4xl font-black italic tracking-tighter text-white">
                                {stats.longestStreak}
                            </div>
                        </div>
                        <div className="text-[10px] font-black text-orange-500/60 uppercase tracking-widest mt-auto">Best Streak</div>
                    </div>

                    {/* Strength Stats (Weight Lifted) */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between min-h-[160px]">
                        <div>
                            <div className="bg-white/10 p-2 rounded-xl w-fit mb-4">
                                <Dumbbell className="w-5 h-5 text-white/40" />
                            </div>
                            <div className="text-2xl font-black italic tracking-tighter text-white">
                                {stats.totalVolume.toLocaleString()}
                                <span className="text-xs uppercase opacity-40 ml-1">lbs</span>
                            </div>
                        </div>
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-auto">Total Volume</div>
                    </div>

                    {/* PR Detector */}
                    <div className="bg-primary/10 border border-primary/20 rounded-3xl p-6 flex flex-col justify-between min-h-[160px]">
                        <div>
                            <div className="bg-primary/20 p-2 rounded-xl w-fit mb-4">
                                <Zap className="w-5 h-5 text-primary" />
                            </div>
                            <div className="text-4xl font-black italic tracking-tighter text-white">
                                {stats.prCount}
                            </div>
                        </div>
                        <div className="text-[10px] font-black text-primary/60 uppercase tracking-widest mt-auto">PRs Smashed</div>
                    </div>
                </div>

                {/* Habit Adherence Detail */}
                {stats.habitStats.length > 0 && (
                    <div className="bg-black/40 rounded-3xl border border-white/5 p-6 shadow-2xl">
                        <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5" />
                            Efficiency Matrix
                        </h4>
                        
                        <div className="space-y-6">
                            {stats.habitStats.map((habit, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-sm font-bold text-white">{habit.name}</div>
                                            <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-0.5">{habit.hits} Successful Days</div>
                                        </div>
                                        <div className="text-xl font-black italic text-primary">{habit.rate}%</div>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary shadow-[0_0_8px_rgba(0,46,93,0.5)] transition-all duration-1000"
                                            style={{ width: `${habit.rate}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Final Wrap-up Quote */}
                <div className="px-8 py-12 text-center opacity-40">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">
                        Forged in the fire of {challenge.title}
                    </p>
                </div>

            </div>
        </div>
    );
};

export default ChallengeSummary;

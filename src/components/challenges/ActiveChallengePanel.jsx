import React, { useMemo, useState } from 'react';
import { Target, CheckCircle2, Circle, Flame, Calendar, Trophy, MoreVertical, X, Pencil, RefreshCw, Ghost } from 'lucide-react';
import { useChallenge } from '../../context/ChallengeContext';

const ActiveChallengePanel = ({ challenge, onEdit }) => {
    const { toggleDailyRule, currentUser, abandonChallenge, completeChallenge } = useChallenge();
    const [showOptions, setShowOptions] = useState(false);
    const [showEndModal, setShowEndModal] = useState(false);
    const [endMode, setEndMode] = useState('complete'); // 'complete' or 'abandon'
    const [reflection, setReflection] = useState('');

    const participant = useMemo(() => {
        return challenge.participants.find(p => p.userId === currentUser.id);
    }, [challenge, currentUser]);

    const todayStr = useMemo(() => new Date().toLocaleDateString('en-US'), []);

    const todayLogs = useMemo(() => {
        return participant?.dailyLogs?.[todayStr] || {};
    }, [participant, todayStr]);

    // Calculate progression
    const { daysTotal, daysPassed, progressPercent } = useMemo(() => {
        const start = new Date(challenge.duration.startDate);
        const end = new Date(challenge.duration.endDate);
        const now = new Date();

        const totalMs = end.getTime() - start.getTime();
        const passedMs = now.getTime() - start.getTime();

        const dTotal = Math.max(1, Math.ceil(totalMs / 86400000));
        const dPassed = Math.max(0, Math.min(dTotal, Math.floor(passedMs / 86400000)));

        return {
            daysTotal: dTotal,
            daysPassed: dPassed + 1, // "Day X"
            progressPercent: Math.min(100, (passedMs / totalMs) * 100)
        };
    }, [challenge.duration]);

    // Calculate a 7-day history matrix
    const historyMatrix = useMemo(() => {
        const matrix = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US');
            
            const dayLogs = participant?.dailyLogs?.[dateStr] || {};
            const label = i === 0 ? 'T' : d.toLocaleDateString('en-US', { weekday: 'narrow' });
            
            matrix.push({
                dateStr,
                label,
                logs: dayLogs,
                isToday: i === 0
            });
        }
        return matrix;
    }, [participant.dailyLogs]);

    if (!participant) return null;

    return (
        <div className="bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/50 ring-1 ring-primary/20 rounded-3xl p-5 shadow-[0_4px_24px_rgba(0,46,93,0.3)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

            {/* Header */}
            <div className="flex justify-between items-start mb-4 relative z-30">
                <div className="flex-1 pr-4">
                    <h3 className="text-xl font-black italic uppercase tracking-tight text-white mb-0.5">{challenge.title}</h3>
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-widest flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        Day {daysPassed} of {daysTotal}
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="bg-primary/20 px-3 py-1.5 rounded-xl border border-primary/30 flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,46,93,0.4)]">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-white tracking-wider">ACTIVE</span>
                    </div>

                    <div className="relative">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowOptions(!showOptions);
                            }}
                            className="p-3 -m-1.5 text-white/40 hover:text-white transition-colors hover:bg-white/10 rounded-full flex items-center justify-center cursor-pointer"
                        >
                            <MoreVertical className="w-6 h-6" />
                        </button>
                        
                        {showOptions && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowOptions(false)} />
                                <div className="absolute right-0 top-full mt-2 w-48 bg-[#111] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowOptions(false);
                                            if (onEdit) onEdit(challenge);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 rounded-xl transition-colors flex items-center gap-2 mb-1"
                                    >
                                        <Pencil className="w-4 h-4 text-primary" />
                                        Edit Challenge
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEndMode('complete');
                                            setReflection('');
                                            setShowEndModal(true);
                                            setShowOptions(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10 rounded-xl transition-colors flex items-center gap-2 mb-1"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        Complete Mission
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEndMode('abandon');
                                            setReflection('');
                                            setShowEndModal(true);
                                            setShowOptions(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2"
                                    >
                                        <X className="w-4 h-4" />
                                        Abandon Challenge
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mb-5">
                <div 
                    className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(0,46,93,0.8)] transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Daily Habits */}
            <div className="space-y-2 relative z-10">
                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    Today's Targets
                </h4>

                {challenge.rules?.map((rule) => {
                    const isDone = !!todayLogs[rule.id];
                    return (
                        <div 
                            key={rule.id}
                            onClick={() => toggleDailyRule(challenge.id, rule.id, todayStr, !isDone)}
                            className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] ${
                                isDone 
                                ? 'bg-primary/10 border-primary/40' 
                                : 'bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/5'
                            }`}
                        >
                            <div className="shrink-0 pointer-events-none">
                                {isDone ? (
                                    <CheckCircle2 className="w-6 h-6 text-primary shadow-sm drop-shadow-[0_0_8px_rgba(0,46,93,0.8)]" />
                                ) : (
                                    <Circle className="w-6 h-6 text-white/20" />
                                )}
                            </div>
                            <div className="flex-1 pointer-events-none">
                                <span className={`text-sm font-bold transition-colors ${isDone ? 'text-white' : 'text-white/80'}`}>
                                    {rule.name}
                                </span>
                                {rule.isWorkoutRule && (
                                    <p className="text-[10px] text-white/40 font-medium mt-0.5">Links to Workouts</p>
                                )}
                            </div>
                        </div>
                    );
                })}

                {(!challenge.rules || challenge.rules.length === 0) && (
                    <div className="text-center py-4 bg-white/5 rounded-2xl border border-white/5 text-white/40 text-xs">
                        No daily habits defined.
                    </div>
                )}
            </div>

            {/* History Matrix Grid */}
            <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-1.5 px-1">
                    <RefreshCw className="w-3.5 h-3.5" />
                    7-Day History
                </h4>

                <div className="space-y-4">
                    {challenge.rules?.map(rule => (
                        <div key={`hist_${rule.id}`} className="flex items-center gap-3">
                            <div className="w-24 shrink-0">
                                <span className="text-[10px] font-bold text-white/40 truncate block uppercase tracking-tight">
                                    {rule.name}
                                </span>
                            </div>
                            <div className="flex-1 flex justify-between items-center pr-1">
                                {historyMatrix.map((day, dIdx) => {
                                    const isDone = !!day.logs[rule.id];
                                    return (
                                        <div key={dIdx} className="flex flex-col items-center gap-1.5">
                                            <div 
                                                className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                                                    isDone 
                                                        ? 'bg-primary shadow-[0_0_8px_rgba(0,46,93,0.8)] scale-110' 
                                                        : day.isToday 
                                                            ? 'border border-white/20 bg-transparent'
                                                            : 'bg-white/5'
                                                }`}
                                            />
                                            <span className={`text-[8px] font-black ${day.isToday ? 'text-primary' : 'text-white/20'}`}>
                                                {day.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* End Mission Modal (Custom replacement for window.prompt) */}
            {showEndModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div 
                        className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-slide-up"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="text-center space-y-2">
                            <div className={`mx-auto w-16 h-16 rounded-3xl flex items-center justify-center mb-4 ${
                                endMode === 'complete' ? 'bg-primary/20 text-primary' : 'bg-red-500/10 text-red-400'
                            }`}>
                                {endMode === 'complete' ? <Trophy className="w-8 h-8" /> : <Ghost className="w-8 h-8" />}
                            </div>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                                {endMode === 'complete' ? 'Mission Success!' : 'Mission Retired'}
                            </h3>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                                The Captain's Log
                            </p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] block px-1">
                                {endMode === 'complete' ? 'Final Reflection' : 'Reason for Retirement'}
                            </label>
                            <textarea 
                                autoFocus
                                value={reflection}
                                onChange={(e) => setReflection(e.target.value)}
                                placeholder={endMode === 'complete' ? 'Objective reached. Victory achieved...' : 'New priorities emerging...'}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none min-h-[120px] resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => setShowEndModal(false)}
                                className="px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white/40 hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    if (endMode === 'complete') {
                                        completeChallenge(challenge.id, reflection || "Objective reached. Success archived.");
                                    } else {
                                        abandonChallenge(challenge.id, reflection || "Mission retired early.");
                                    }
                                    setShowEndModal(false);
                                }}
                                className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-lg transition-transform active:scale-95 ${
                                    endMode === 'complete' ? 'bg-primary' : 'bg-red-500'
                                }`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActiveChallengePanel;

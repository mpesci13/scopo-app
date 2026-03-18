import React, { useMemo, useState, useEffect } from 'react';
import { Clock, Dumbbell, Calendar, MessageSquare, ChevronRight, ChevronLeft, ArrowRight, Bookmark, Check, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { useChallenge } from '../context/ChallengeContext';

const History = () => {
    const { sessions, saveSessionAsTemplate, routines, updateSession } = useWorkout();
    const { activeUserChallenges, currentUser, linkWorkoutToChallenge, unlinkWorkoutFromChallenge, updateChallengeWorkoutStats } = useChallenge();
    const [selectedSession, setSelectedSession] = useState(null);
    
    // Edit & Challenge State
    const [isEditing, setIsEditing] = useState(false);
    const [editedSession, setEditedSession] = useState(null);
    const [selectedChallengeIds, setSelectedChallengeIds] = useState([]);
    
    // Template Saving State
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [selectedRoutineId, setSelectedRoutineId] = useState(null);
    const [templateSaved, setTemplateSaved] = useState(false);

    // Initialize edit state when a session is selected or edit mode is toggled
    useEffect(() => {
        if (selectedSession && isEditing) {
            // Clone the session to edit
            setEditedSession(JSON.parse(JSON.stringify(selectedSession)));
            
            // Determine which challenges are currently linked
            const initialLinkedIds = activeUserChallenges
                .filter(c => c.participants.find(p => p.userId === currentUser.id)?.linkedWorkoutIds?.includes(selectedSession.id))
                .map(c => c.id);
            setSelectedChallengeIds(initialLinkedIds);
        }
    }, [selectedSession, isEditing, activeUserChallenges, currentUser.id]);

    const handleSaveChanges = () => {
        if (!editedSession) return;

        // Recalculate volume and sets
        let newVolume = 0;
        let newTotalSets = 0;
        
        editedSession.exercises.forEach(ex => {
            ex.sets.forEach(s => {
                if (s.completed && s.weight && s.reps) {
                    newVolume += (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0);
                    newTotalSets++;
                }
            });
        });

        const newStats = { volume: newVolume, sets: newTotalSets, duration: editedSession.duration };
        const oldStats = { volume: selectedSession.volume, sets: selectedSession.totalSets };

        // Handle challenges
        const originalLinkedIds = activeUserChallenges
            .filter(c => c.participants.find(p => p.userId === currentUser.id)?.linkedWorkoutIds?.includes(selectedSession.id))
            .map(c => c.id);

        originalLinkedIds.forEach(id => {
            if (!selectedChallengeIds.includes(id)) {
                unlinkWorkoutFromChallenge(selectedSession.id, id, oldStats);
            }
        });

        selectedChallengeIds.forEach(id => {
            if (!originalLinkedIds.includes(id)) {
                linkWorkoutToChallenge(selectedSession.id, id, editedSession.exercises, newStats);
            }
        });

        selectedChallengeIds.forEach(id => {
            if (originalLinkedIds.includes(id)) {
                updateChallengeWorkoutStats(selectedSession.id, oldStats, newStats);
            }
        });

        // Update global logs via WorkoutContext
        updateSession(selectedSession.id, editedSession.exercises, newStats);

        // Refresh UI state
        setSelectedSession({ ...editedSession, volume: newVolume, totalSets: newTotalSets });
        setIsEditing(false);
    };

    const handleSetEdit = (exerciseIndex, setIndex, field, value) => {
        setEditedSession(prev => {
            const next = { ...prev };
            next.exercises[exerciseIndex].sets[setIndex] = {
                ...next.exercises[exerciseIndex].sets[setIndex],
                [field]: value
            };
            return next;
        });
    };

    const handleAddSet = (exerciseIndex) => {
        setEditedSession(prev => {
            const next = { ...prev };
            next.exercises[exerciseIndex].sets.push({
                id: Date.now() + Math.random(),
                weight: '',
                reps: '',
                rpe: 0,
                completed: true // auto complete new sets
            });
            return next;
        });
    };

    const handleRemoveSet = (exerciseIndex, setIndex) => {
        setEditedSession(prev => {
            const next = { ...prev };
            next.exercises[exerciseIndex].sets.splice(setIndex, 1);
            return next;
        });
    };

    const toggleChallenge = (id) => {
        setSelectedChallengeIds(prev => 
            prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
        );
    };

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
                        onClick={() => {
                            setSelectedSession(null);
                            setIsSavingTemplate(false);
                            setTemplateSaved(false);
                            setTemplateName('');
                            setSelectedRoutineId(null);
                        }}
                        className="p-2 -ml-2 text-white/60 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                        <h2 className="text-lg font-bold text-white tracking-tight leading-none">Workout Details</h2>
                        <span className="text-xs text-white/40 font-mono uppercase tracking-wider">{formatDate(selectedSession.date)}</span>
                    </div>
                    <div className="w-10 flex justify-end">
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="p-2 text-white/60 hover:text-white transition-colors">
                                <Edit2 className="w-5 h-5" />
                            </button>
                        ) : (
                            <button onClick={() => setIsEditing(false)} className="p-2 text-red-500/80 hover:text-red-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 pb-36">

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
                            {(isEditing ? editedSession : selectedSession).exercises.map((ex, idx) => (
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
                                            <div className="text-center text-primary/60">{isEditing ? 'Del' : 'RPE'}</div>
                                        </div>

                                        {/* Sets */}
                                        {ex.sets.map((set, sIdx) => (
                                            <div
                                                key={set.id || sIdx}
                                                className={`grid grid-cols-4 gap-2 px-2 py-2 rounded-lg items-center ${set.completed ? 'bg-black/40 border border-white/5' : 'opacity-30'}`}
                                            >
                                                <div className="text-center text-xs font-mono text-white/40">{sIdx + 1}</div>
                                                {isEditing ? (
                                                    <>
                                                        <div className="text-center">
                                                            <input type="number" value={set.weight} onChange={(e) => handleSetEdit(idx, sIdx, 'weight', e.target.value)} className="w-full bg-transparent text-center font-mono font-bold text-white focus:outline-none border-b border-primary/50 py-1" />
                                                        </div>
                                                        <div className="text-center">
                                                            <input type="number" value={set.reps} onChange={(e) => handleSetEdit(idx, sIdx, 'reps', e.target.value)} className="w-full bg-transparent text-center font-mono font-bold text-white focus:outline-none border-b border-primary/50 py-1" />
                                                        </div>
                                                        <div className="text-center flex justify-center items-center">
                                                            <button onClick={() => handleRemoveSet(idx, sIdx)} className="text-red-500/60 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="text-center font-mono font-bold">{set.weight || '-'}</div>
                                                        <div className="text-center font-mono font-bold">{set.reps || '-'}</div>
                                                        <div className="text-center font-mono text-primary/80">{set.rpe || '-'}</div>
                                                    </>
                                                )}
                                            </div>
                                        ))}

                                        {isEditing && (
                                            <button onClick={() => handleAddSet(idx)} className="mt-3 w-full py-2 border border-dashed border-white/20 rounded-xl text-xs font-bold text-white/40 hover:text-white/60 hover:border-white/40 transition-colors flex items-center justify-center gap-2">
                                                <Plus className="w-3 h-3" /> Add Set
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Challenge Links */}
                    {activeUserChallenges.length > 0 && (
                        <div className="space-y-4 pt-4 border-t border-white/10 mt-6">
                            <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest px-2">Challenge Links</h3>
                            <div className="flex flex-col gap-3">
                                {activeUserChallenges.map(challenge => {
                                    const isSelected = selectedChallengeIds.includes(challenge.id);
                                    if (!isEditing && !isSelected) return null; // In view mode, only show linked ones
                                    
                                    return (
                                        <button
                                            key={challenge.id}
                                            onClick={() => isEditing && toggleChallenge(challenge.id)}
                                            className={`p-4 rounded-2xl flex items-center justify-between transition-all border ${
                                                isSelected 
                                                ? 'bg-primary/20 border-primary/50 shadow-[0_0_20px_rgba(0,46,93,0.3)]' 
                                                : 'bg-white/5 border-white/10'
                                            } ${isEditing ? 'active:scale-[0.98] cursor-pointer hover:bg-white/10' : 'cursor-default'}`}
                                        >
                                            <div className="flex flex-col items-start">
                                                <span className={`font-bold ${isSelected ? 'text-primary' : 'text-white'}`}>{challenge.title}</span>
                                                <div className="text-xs text-white/40 font-mono mt-0.5">
                                                    Goal: {challenge.goalType}
                                                </div>
                                            </div>
                                            {isEditing && (
                                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                                                    isSelected ? 'bg-primary border-primary' : 'border-white/20'
                                                }`}>
                                                    {isSelected && <Check className="w-4 h-4 text-white" />}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                                {!isEditing && activeUserChallenges.filter(c => selectedChallengeIds.includes(c.id)).length === 0 && (
                                    <p className="text-xs text-white/40 px-2 italic">Not linked to any active challenges.</p>
                                )}
                            </div>
                        </div>
                    )}

                </div>
                
                {/* Fixed Action Footer */}
                <div className="fixed bottom-20 left-0 right-0 p-6 z-30 flex justify-center pointer-events-none">
                    {isEditing ? (
                        <button
                            onClick={handleSaveChanges}
                            className="w-full max-w-[320px] py-4 bg-primary text-white rounded-full font-bold text-lg shadow-[0_4px_20px_rgba(0,46,93,0.5)] active:scale-95 transition-all outline-none pointer-events-auto flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" /> Save Changes
                        </button>
                    ) : isSavingTemplate && !templateSaved ? (
                        <div className="w-full max-w-[320px] bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-3xl animate-fade-in shadow-[0_8px_30px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col p-4 space-y-4 pointer-events-auto">
                            <div className="flex items-center gap-2 bg-black/40 rounded-full p-1 border border-white/5">
                                <input
                                    type="text"
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    onBlur={(e) => {
                                        setTimeout(() => {
                                            if (!templateSaved) {
                                                setIsSavingTemplate(false);
                                                setTemplateName('');
                                                setSelectedRoutineId(null);
                                            }
                                        }, 150);
                                    }}
                                    placeholder="Template Name..."
                                    className="flex-1 bg-transparent px-4 text-sm text-white placeholder:text-white/30 focus:outline-none"
                                    autoFocus
                                />
                                <button
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                        if (templateName.trim() && selectedRoutineId) {
                                            saveSessionAsTemplate(templateName, selectedSession.exercises, selectedRoutineId);
                                            setTemplateSaved(true);
                                        }
                                    }}
                                    disabled={!templateName.trim() || !selectedRoutineId}
                                    className="p-3 bg-primary text-white rounded-full shrink-0 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50 disabled:bg-primary/50"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div className="border-t border-white/5 pt-3">
                                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 px-1 text-left">Save to Library Folder</h4>
                                <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 px-1">
                                    {routines.map(routine => (
                                        <button
                                            key={routine.id}
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => setSelectedRoutineId(routine.id)}
                                            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 whitespace-nowrap ${
                                                selectedRoutineId === routine.id
                                                    ? 'bg-primary text-white shadow-[0_0_15px_rgba(0,46,93,0.5)]'
                                                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                                            }`}
                                        >
                                            {routine.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => !templateSaved && setIsSavingTemplate(true)}
                            className={`px-6 py-2.5 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.5)] pointer-events-auto ${
                                templateSaved 
                                    ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
                                    : 'bg-[#1a1a1a]/95 hover:bg-[#2a2a2a] backdrop-blur-xl border border-white/10 text-white/60 hover:text-white'
                            }`}
                        >
                            {templateSaved ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Saved to Library
                                </>
                            ) : (
                                <>
                                    <Bookmark className="w-4 h-4" />
                                    Save as Template
                                </>
                            )}
                        </button>
                    )}
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

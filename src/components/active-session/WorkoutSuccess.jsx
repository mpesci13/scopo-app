import React, { useState } from 'react';
import { MessageSquare, Share, Bookmark, Check, AlertTriangle, ChevronDown } from 'lucide-react';

import CelebrationModal from './CelebrationModal';
import { useWorkout } from '../../context/WorkoutContext';
import { useChallenge } from '../../context/ChallengeContext';

const WorkoutSuccess = ({ stats, onCompleteLog, onClose, onViewHistory, workoutData }) => {
    const { saveSessionAsTemplate, routines } = useWorkout();
    const { activeUserChallenges } = useChallenge();
    const [rpe, setRpe] = useState(5);
    const [notes, setNotes] = useState('');
    const [showCelebration, setShowCelebration] = useState(false);
    const [selectedChallengeIds, setSelectedChallengeIds] = useState([]);
    
    // Template Saving State
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [selectedRoutineId, setSelectedRoutineId] = useState(null);
    const [templateSaved, setTemplateSaved] = useState(false);

    const isDuplicateName = () => {
        if (!templateName.trim()) return false;
        const nameToCheck = templateName.trim().toLowerCase();
        return routines.some(routine => 
            routine.templates && routine.templates.some(t => t.name.toLowerCase() === nameToCheck)
        );
    };

    const handleComplete = () => {
        onCompleteLog(rpe, notes, selectedChallengeIds);
        setShowCelebration(true);
    };

    const toggleChallenge = (id) => {
        setSelectedChallengeIds(prev => 
            prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
        );
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col overflow-y-auto">
            {showCelebration && (
                <CelebrationModal
                    onClose={onClose}
                    onViewHistory={onViewHistory}
                />
            )}

            {/* Ambient Glow */}
            <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

            {/* ... rest of the UI ... */}
            <div className="flex-1 flex flex-col items-center p-6 pb-4 animate-fade-in text-center max-w-md mx-auto w-full">

                {/* Headline & Streak */}
                <div className="mt-8 space-y-2">
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1 rounded-full mb-6">
                        <span className="text-orange-500 text-xs">🔥</span>
                        <span className="text-white/60 text-xs font-bold uppercase tracking-wider">3 Day Streak</span>
                    </div>

                    <div className="transform -rotate-3 space-y-0">
                        <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic leading-none">
                            Great
                        </h1>
                        <h1 className="text-6xl font-black text-primary uppercase tracking-tighter italic leading-none">
                            Work!
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

                {/* Challenge Contribution */}
                {activeUserChallenges.length > 0 && (
                    <div className="w-full mt-8 space-y-4">
                        <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest text-left px-2">Challenge Contribution</h3>
                        <div className="relative">
                            <select
                                value={selectedChallengeIds.length > 0 ? selectedChallengeIds[0] : ''}
                                onChange={(e) => {
                                    if (e.target.value === '') {
                                        setSelectedChallengeIds([]);
                                    } else {
                                        setSelectedChallengeIds([e.target.value]);
                                    }
                                }}
                                className="w-full appearance-none bg-black/40 border border-white/10 text-white placeholder:text-white/20 rounded-xl p-4 pr-12 focus:outline-none focus:border-primary transition-colors text-sm font-medium"
                            >
                                <option value="" className="text-white/40 bg-[#0a0a0a]">Unassociated (No Challenge)</option>
                                {activeUserChallenges.map(challenge => (
                                    <option key={challenge.id} value={challenge.id} className="bg-[#0a0a0a] text-white">
                                        {challenge.title}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
                        </div>
                    </div>
                )}
            </div>

            {/* INLINE Footer Action */}
            <div className="w-full pt-0 pb-40 space-y-3 relative z-10 flex flex-col items-center">
                <button
                    onClick={handleComplete}
                    className="w-full max-w-[85%] py-4 bg-primary text-white rounded-full font-bold text-lg shadow-[0_4px_20px_rgba(0,46,93,0.5)] active:scale-95 transition-all outline-none"
                >
                    Complete Log
                </button>

                {/* Save Template Section */}
                {isSavingTemplate && !templateSaved ? (
                    <div className="w-full max-w-[90%] bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-3xl animate-fade-in shadow-[0_8px_30px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col p-4 space-y-4">
                        <div className="flex flex-col gap-2 relative">
                            <div className="flex justify-between items-center px-1">
                                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest text-left">Save as New Template</h4>
                                <button onClick={() => {
                                    setIsSavingTemplate(false);
                                    setTemplateName('');
                                    setSelectedRoutineId(null);
                                }} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                                    <X className="w-3 h-3 text-white/40" />
                                </button>
                            </div>
                            <div className={`flex items-center gap-2 bg-black/40 rounded-full p-1 border transition-colors ${isDuplicateName() ? 'border-red-500/50' : 'border-white/5'}`}>
                                <input
                                    type="text"
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    placeholder="Template Name..."
                                    className={`flex-1 bg-transparent px-4 text-sm focus:outline-none transition-colors ${isDuplicateName() ? 'text-red-400' : 'text-white placeholder:text-white/30'}`}
                                    autoFocus
                                />
                                <button
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                        if (templateName.trim() && !isDuplicateName() && selectedRoutineId) {
                                            saveSessionAsTemplate(templateName, workoutData, selectedRoutineId);
                                            setTemplateSaved(true);
                                        }
                                    }}
                                    disabled={!templateName.trim() || isDuplicateName() || !selectedRoutineId}
                                    className="p-3 bg-primary text-white rounded-full shrink-0 flex items-center justify-center active:scale-95 transition-all disabled:opacity-50 disabled:bg-white/10 disabled:text-white/40"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                            </div>
                            {isDuplicateName() && (
                                <p className="text-red-500 text-xs font-medium px-4 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Template name already exists.
                                </p>
                            )}
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
                    <div className="w-full max-w-[85%] flex gap-3 mt-2">
                        <button
                            onClick={() => !templateSaved && setIsSavingTemplate(true)}
                            className={`flex-1 py-3 border font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 rounded-full ${
                                templateSaved 
                                    ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                                    : 'bg-transparent hover:bg-white/5 border-transparent text-white/40 hover:text-white/60'
                            }`}
                        >
                            {templateSaved ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Saved
                                </>
                            ) : (
                                <>
                                    <Bookmark className="w-4 h-4" />
                                    Save as Template
                                </>
                            )}
                        </button>
                        
                        <button
                            className="flex-1 py-3 bg-transparent hover:bg-white/5 border border-transparent text-white/40 hover:text-white/60 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95 rounded-full"
                        >
                            <Share className="w-4 h-4" />
                            Share
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkoutSuccess;

import React, { useState } from 'react';
import { Target, Calendar, Plus, X, ArrowLeft, RefreshCw, Layers, Pencil, Check } from 'lucide-react';
import { useChallenge } from '../../context/ChallengeContext';

const CreateChallengeFlow = ({ onBack, onComplete, initialTemplate = null, challengeToEdit = null }) => {
    const { createCustomChallenge, updateChallenge } = useChallenge();
    const [title, setTitle] = useState(challengeToEdit?.title || initialTemplate?.title || '');
    
    // Duration Logic
    const calculateInitialDuration = () => {
        if (challengeToEdit) {
            const start = new Date(challengeToEdit.duration.startDate);
            const end = new Date(challengeToEdit.duration.endDate);
            const diffDays = Math.ceil((end.getTime() - start.getTime()) / 86400000);
            return diffDays.toString();
        }
        return initialTemplate?.durationValue || '30';
    };

    // Duration State
    const [durationType, setDurationType] = useState(initialTemplate?.durationType || 'days'); // 'days', 'weeks', 'date'
    const [durationValue, setDurationValue] = useState(calculateInitialDuration());
    const [targetDate, setTargetDate] = useState('');

    const [rules, setRules] = useState(challengeToEdit?.rules || initialTemplate?.rules || []);

    // Edit Rule State
    const [editingRuleId, setEditingRuleId] = useState(null);
    const [editRuleName, setEditRuleName] = useState('');
    const [editIsWorkoutRule, setEditIsWorkoutRule] = useState(false);

    const startEditing = (rule) => {
        setEditingRuleId(rule.id);
        setEditRuleName(rule.name);
        setEditIsWorkoutRule(rule.isWorkoutRule || false);
    };

    const saveEdit = () => {
        if (!editRuleName.trim()) return;
        setRules(rules.map(r => 
            r.id === editingRuleId 
                ? { ...r, name: editRuleName.trim(), isWorkoutRule: editIsWorkoutRule } 
                : r
        ));
        setEditingRuleId(null);
    };

    // Error State
    const [errorMsg, setErrorMsg] = useState('');

    // New Rule State
    const [newRuleName, setNewRuleName] = useState('');
    const [isWorkoutRule, setIsWorkoutRule] = useState(false);

    const handleAddRule = () => {
        if (!newRuleName.trim() || rules.length >= 5) return;
        
        const rule = {
            id: `rule_${Date.now()}`,
            name: newRuleName.trim(),
            type: 'daily_habit',
            isWorkoutRule
        };

        setRules([...rules, rule]);
        setNewRuleName('');
        setIsWorkoutRule(false);
    };

    const handleRemoveRule = (id) => {
        setRules(rules.filter(r => r.id !== id));
    };

    const handleCreate = () => {
        if (!title.trim()) {
            setErrorMsg("Please enter a Challenge Name.");
            setTimeout(() => setErrorMsg(''), 3000);
            return;
        }
        if (rules.length === 0) {
            setErrorMsg("Please add at least one Daily Habit.");
            setTimeout(() => setErrorMsg(''), 3000);
            return;
        }
        if (durationType === 'date' && !targetDate) {
            setErrorMsg("Please select an end date.");
            setTimeout(() => setErrorMsg(''), 3000);
            return;
        }
        
        setErrorMsg('');
        
        let calculatedDays = 30;
        const durVal = parseInt(durationValue) || 1;
        if (durationType === 'days') {
            calculatedDays = durVal;
        } else if (durationType === 'weeks') {
            calculatedDays = durVal * 7;
        } else if (durationType === 'date' && targetDate) {
            const diffMs = new Date(targetDate).getTime() - new Date().getTime();
            calculatedDays = Math.max(1, Math.ceil(diffMs / 86400000));
        }

        if (challengeToEdit) {
            updateChallenge(challengeToEdit.id, {
                title: title.trim(),
                durationDays: calculatedDays,
                rules
            });
        } else {
            createCustomChallenge(title.trim(), calculatedDays, rules);
        }

        if (onComplete) onComplete();
    };

    const isFormIncomplete = !title.trim() || rules.length === 0 || (durationType === 'date' && !targetDate);

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a] text-white animate-fade-in relative z-50">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b border-white/5">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 text-white/60 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold">{challengeToEdit ? 'Edit Challenge' : 'Build Challenge'}</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-48">
                {/* Basic Info */}
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">
                            Challenge Name
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. 75 Hard, Spring Cut, etc."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-lg text-white font-medium focus:border-primary focus:outline-none transition-colors placeholder:text-white/20"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">
                            Duration Setup
                        </label>
                        
                        <div className="flex gap-2 mb-3 bg-white/5 p-1 rounded-xl">
                            {['days', 'weeks', 'date'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setDurationType(type)}
                                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                                        durationType === type 
                                            ? 'bg-primary text-white shadow-md' 
                                            : 'text-white/40 hover:text-white/80 hover:bg-white/10'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
                            {durationType === 'date' ? (
                                <input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={targetDate}
                                    onChange={(e) => setTargetDate(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-base text-white font-medium focus:border-primary focus:outline-none transition-colors [color-scheme:dark]"
                                />
                            ) : (
                                <input
                                    type="number"
                                    min="1"
                                    max={durationType === 'weeks' ? 52 : 365}
                                    value={durationValue}
                                    onChange={(e) => setDurationValue(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-lg text-white font-medium focus:border-primary focus:outline-none transition-colors"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Rules Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                            Daily Habits ({rules.length}/5)
                        </label>
                    </div>

                    {/* Current Rules */}
                    <div className="space-y-2">
                        {rules.map((rule, idx) => (
                            <div key={rule.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 group">
                                <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-bold text-white/60">{idx + 1}</span>
                                </div>
                                
                                {editingRuleId === rule.id ? (
                                    <div className="flex-1 space-y-3">
                                        <input
                                            type="text"
                                            value={editRuleName}
                                            onChange={(e) => setEditRuleName(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-sm text-white focus:border-primary focus:outline-none placeholder:text-white/20"
                                            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                            autoFocus
                                        />
                                        <label className="flex items-center gap-2 cursor-pointer w-max">
                                            <input
                                                type="checkbox"
                                                checked={editIsWorkoutRule}
                                                onChange={(e) => setEditIsWorkoutRule(e.target.checked)}
                                                className="w-4 h-4 rounded border-white/20 bg-black/40 text-primary focus:ring-primary focus:ring-offset-black"
                                            />
                                            <span className="text-xs text-white/80 select-none">Link to Workouts</span>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm text-white">{rule.name}</h4>
                                        {rule.isWorkoutRule && (
                                            <div className="flex items-center gap-1 mt-1 text-[10px] text-blue-400 font-medium">
                                                <RefreshCw className="w-3 h-3" />
                                                Auto-ticks on workout
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-1 shrink-0">
                                    {editingRuleId === rule.id ? (
                                        <button
                                            onClick={saveEdit}
                                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => startEditing(rule)}
                                                className="p-2 text-white/20 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleRemoveRule(rule.id)}
                                                className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}

                        {rules.length === 0 && (
                            <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-6 text-center text-white/40 text-sm">
                                No habits added yet. Define the daily requirements for your challenge below.
                            </div>
                        )}
                    </div>

                    {/* Add New Rule */}
                    {rules.length < 5 && (
                        <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-4 space-y-4 relative overflow-hidden mt-4">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                            
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                <Target className="w-4 h-4 text-primary" />
                                Create New Habit
                            </h4>

                            {/* Quick Add: Do */}
                            <div className="space-y-1 mt-3">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Things To Do</label>
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                                    {[
                                        { name: '💧 1 Gallon Water' },
                                        { name: '🥾 10k Steps' },
                                        { name: '📚 Read 10 Pages' },
                                        { name: '🏋️ Workout', isWorkoutRule: true },
                                        { name: '💤 8h Sleep' }
                                    ].map((preset, i) => (
                                        <button
                                            key={`do_${i}`}
                                            onClick={() => {
                                                if (rules.length >= 5) return;
                                                setRules([...rules, {
                                                    id: `rule_do_${Date.now()}_${i}`,
                                                    name: preset.name,
                                                    type: 'daily_habit',
                                                    isWorkoutRule: preset.isWorkoutRule || false
                                                }]);
                                            }}
                                            className="shrink-0 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-full text-xs font-semibold text-primary transition-colors whitespace-nowrap active:scale-95 shadow-sm flex items-center gap-1.5"
                                        >
                                            <Plus className="w-3 h-3" />
                                            {preset.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Add: Don't Do */}
                            <div className="space-y-1 mb-3">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Things To Avoid</label>
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                                    {[
                                        { name: '🚫 No Sugar' },
                                        { name: '🍷 No Alcohol' },
                                        { name: '📱 No Screens pre-bed' },
                                        { name: '🍔 No Fast Food' }
                                    ].map((preset, i) => (
                                        <button
                                            key={`avoid_${i}`}
                                            onClick={() => {
                                                if (rules.length >= 5) return;
                                                setRules([...rules, {
                                                    id: `rule_avoid_${Date.now()}_${i}`,
                                                    name: preset.name,
                                                    type: 'daily_habit',
                                                    isWorkoutRule: preset.isWorkoutRule || false
                                                }]);
                                            }}
                                            className="shrink-0 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-full text-xs font-semibold text-red-400 transition-colors whitespace-nowrap active:scale-95 shadow-sm flex items-center gap-1.5"
                                        >
                                            <Plus className="w-3 h-3" />
                                            {preset.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <input
                                type="text"
                                placeholder="e.g. Read 10 Pages, Eat 2100kcal"
                                value={newRuleName}
                                onChange={(e) => setNewRuleName(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary focus:outline-none transition-colors placeholder:text-white/20"
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter') handleAddRule();
                                }}
                            />

                            <label className="flex items-start gap-3 cursor-pointer group pt-2">
                                <div className={`shrink-0 mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                    isWorkoutRule ? 'bg-primary border-primary' : 'bg-transparent border-white/20 group-hover:border-white/40'
                                }`}>
                                    {isWorkoutRule && <Layers className="w-3 h-3 text-white" />}
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-white/80 select-none">Link to Workouts</span>
                                    <p className="text-[10px] text-white/40 mt-0.5 select-none leading-snug pr-4">Auto-checks when you select this challenge from the dropdown after logging a workout.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={isWorkoutRule}
                                    onChange={(e) => setIsWorkoutRule(e.target.checked)}
                                />
                            </label>

                            <button
                                onClick={handleAddRule}
                                disabled={!newRuleName.trim()}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-white/5 border border-white/10 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Habit to Challenge
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pointer-events-none z-10 pb-32 md:static md:bg-none md:p-4 md:pointer-events-auto flex flex-col items-center">
                {errorMsg && (
                    <div className="mb-3 bg-red-500/10 border border-red-500/30 text-red-500 px-5 py-2 rounded-full text-xs font-bold animate-fade-in pointer-events-auto shadow-lg backdrop-blur-md">
                        {errorMsg}
                    </div>
                )}
                <button
                    onClick={handleCreate}
                    className={`w-full py-4 bg-primary text-white rounded-2xl font-black italic uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,46,93,0.4)] pointer-events-auto active:scale-95 ${
                        isFormIncomplete ? 'opacity-50' : 'opacity-100'
                    }`}
                >
                    {challengeToEdit ? 'Save Changes' : 'Launch Challenge'}
                </button>
            </div>
        </div>
    );
};

export default CreateChallengeFlow;

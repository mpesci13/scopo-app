import React, { useState } from 'react';
import { ChevronDown, Check, Plus, Trash2 } from 'lucide-react';

const RPEBar = ({ value, onChange }) => {
    return (
        <div className="flex h-8 w-full bg-white/5 rounded-lg overflow-hidden border border-white/10">
            {[1, 2, 3, 4, 5].map((level) => (
                <button
                    key={level}
                    onClick={() => onChange(level)}
                    className={`flex-1 transition-all duration-300 ${level <= value
                            ? 'bg-primary shadow-[0_0_10px_rgba(0,46,93,0.6)]'
                            : 'hover:bg-white/10'
                        } ${level < 5 ? 'border-r border-black/20' : ''}`}
                />
            ))}
        </div>
    );
};

const ProgressCircle = ({ total, completed }) => {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const progress = total === 0 ? 0 : (completed / total) * circumference;

    return (
        <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="transform -rotate-90 w-12 h-12">
                <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    className="text-white/10"
                />
                <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                    className="text-primary transition-all duration-500 ease-out"
                    strokeLinecap="round"
                />
            </svg>
            <span className="absolute text-[10px] font-bold text-white">
                {completed}/{total}
            </span>
        </div>
    );
};

const ExerciseCard = ({ exercise, isExpanded, onToggleExpand, onRemove }) => {
    // Initial mockup state for sets. In a real app, this would be lifted or synced.
    const [sets, setSets] = useState([
        { id: 1, weight: '', reps: '', rpe: 0, completed: false },
        { id: 2, weight: '', reps: '', rpe: 0, completed: false },
        { id: 3, weight: '', reps: '', rpe: 0, completed: false },
    ]);

    // Calculate completed sets for the circle
    const completedSets = sets.filter(s => s.completed).length;

    const toggleSetComplete = (id) => {
        setSets(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
    };

    const updateSet = (id, field, value) => {
        setSets(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const addSet = () => {
        const lastSet = sets[sets.length - 1];
        setSets(prev => [
            ...prev,
            {
                id: Date.now(),
                weight: lastSet ? lastSet.weight : '',
                reps: lastSet ? lastSet.reps : '',
                rpe: 0,
                completed: false
            }
        ]);
    };

    return (
        <div className={`bg-[#111] border border-white/10 rounded-[20px] overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-1 ring-primary/50' : ''}`}>
            {/* Header / Collapsed State */}
            <div
                onClick={onToggleExpand}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <ProgressCircle total={sets.length} completed={completedSets} />
                    <div>
                        <h3 className="text-lg font-bold text-white leading-tight">{exercise.name}</h3>
                        <p className="text-xs text-white/40 pt-1">Target: {exercise.category}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {!isExpanded && (
                        <div className="text-right hidden sm:block">
                            <p className="text-xs text-white/40">Best</p>
                            <p className="text-sm font-semibold text-white">225 x 5</p>
                        </div>
                    )}
                    <ChevronDown className={`w-5 h-5 text-white/40 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="p-4 pt-0 space-y-4 animate-fade-in">
                    {/* Column Headers */}
                    <div className="grid grid-cols-[3fr_2fr_2fr_3fr_1fr] gap-3 px-2 text-[10px] uppercase tracking-wider text-white/30 font-semibold">
                        <div>Set</div>
                        <div className="text-center">lbs</div>
                        <div className="text-center">Reps</div>
                        <div className="text-center">RPE</div>
                        <div className="text-center">Done</div>
                    </div>

                    {/* Sets */}
                    <div className="space-y-3">
                        {sets.map((set, index) => (
                            <div key={set.id} className="grid grid-cols-[3fr_2fr_2fr_3fr_1fr] gap-3 items-center">
                                <span className="text-sm font-bold text-white/40 px-2">Set {index + 1}</span>

                                <input
                                    type="number"
                                    placeholder="0"
                                    value={set.weight}
                                    onChange={(e) => updateSet(set.id, 'weight', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 text-center text-white font-medium focus:border-primary focus:outline-none transition-colors placeholder:text-white/10"
                                />

                                <input
                                    type="text"
                                    placeholder="0"
                                    value={set.reps}
                                    onChange={(e) => updateSet(set.id, 'reps', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 text-center text-white font-medium focus:border-primary focus:outline-none transition-colors placeholder:text-white/10"
                                />

                                <div className="flex items-center">
                                    <RPEBar value={set.rpe} onChange={(val) => updateSet(set.id, 'rpe', val)} />
                                </div>

                                <button
                                    onClick={() => toggleSetComplete(set.id)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all mx-auto ${set.completed
                                            ? 'bg-primary text-white shadow-[0_0_10px_rgba(0,46,93,0.5)]'
                                            : 'bg-white/5 text-transparent border border-white/10 hover:border-primary/50'
                                        }`}
                                >
                                    <Check className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                        <button
                            onClick={onRemove}
                            className="text-xs font-medium text-red-400 hover:text-red-300 px-2"
                        >
                            Remove Exercise
                        </button>
                        <button
                            onClick={addSet}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-semibold text-primary transition-colors border border-primary/20"
                        >
                            <Plus className="w-3 h-3" />
                            Add Set
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExerciseCard;

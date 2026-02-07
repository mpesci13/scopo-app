import React, { useState, useRef } from 'react';
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

const SwipeableSetRow = ({ children, onDelete }) => {
    const [offsetX, setOffsetX] = useState(0);
    const startX = useRef(0);

    const onTouchStart = (e) => {
        startX.current = e.touches[0].clientX;
    };

    const onTouchMove = (e) => {
        const currentX = e.touches[0].clientX;
        const diff = currentX - startX.current;
        // Only allow swiping left (negative diff), capped at -80px logic
        if (diff < 0 && diff > -100) {
            setOffsetX(diff);
        }
    };

    const onTouchEnd = () => {
        if (offsetX < -40) {
            setOffsetX(-80); // Reveal delete
        } else {
            setOffsetX(0); // Snap back
        }
    };

    // Reset on outside click or something? Ideally we have a way to close it.
    // For now, if they swipe back right, it closes (handled by onTouchMove/End logic if we allowed right swipe, currently strict left).
    // Let's allow snapping back to 0 if they tap it?

    return (
        <div className="relative overflow-hidden group/swipe">
            {/* Delete Background / Button */}
            <div
                className="absolute inset-y-0 right-0 w-20 bg-red-500 flex items-center justify-center z-0 cursor-pointer"
                onClick={onDelete}
            >
                <Trash2 className="w-5 h-5 text-white" />
            </div>

            {/* Foreground Content */}
            <div
                className="relative z-10 bg-[#111] transition-transform duration-200 ease-out flex items-center"
                style={{ transform: `translateX(${offsetX}px)` }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onClick={() => setOffsetX(0)} // Tap to close
            >
                {children}
            </div>
        </div>
    );
};

const ExerciseCard = ({ exercise, isExpanded, onToggleExpand, onRemove, onUpdateSets }) => {
    // Sets are now passed in via exercise.sets
    const sets = exercise.sets || [];

    // Calculate completed sets for the circle
    const completedSets = sets.filter(s => s.completed).length;

    const toggleSetComplete = (id) => {
        const newSets = sets.map(s => s.id === id ? { ...s, completed: !s.completed } : s);
        onUpdateSets(newSets);
    };

    const updateSet = (id, field, value) => {
        const newSets = sets.map(s => s.id === id ? { ...s, [field]: value } : s);
        onUpdateSets(newSets);
    };

    const addSet = () => {
        const lastSet = sets[sets.length - 1];
        const newSet = {
            id: Date.now(),
            weight: lastSet ? lastSet.weight : '',
            reps: lastSet ? lastSet.reps : '',
            rpe: 0,
            completed: false
        };
        onUpdateSets([...sets, newSet]);
    };

    const removeSet = (id) => {
        onUpdateSets(sets.filter(s => s.id !== id));
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
                        <p className="text-xs text-white/40 pt-1">Target: {exercise.bodyPart}</p>
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
                    <div className="grid grid-cols-[2rem_1fr_1fr_1fr_2rem] gap-2 px-0 text-[10px] uppercase tracking-wider text-white/30 font-semibold items-center text-center">
                        <div className="text-left pl-2">Set</div>
                        <div>lbs</div>
                        <div>Reps</div>
                        <div>RPE</div>
                        <div>Done</div>
                    </div>

                    {/* Sets */}
                    <div className="space-y-3">
                        {sets.map((set, index) => (
                            <SwipeableSetRow key={set.id} onDelete={() => removeSet(set.id)}>
                                <div key={set.id} className="grid grid-cols-[2rem_1fr_1fr_1fr_2rem] gap-2 items-center w-full bg-[#111] pr-1">
                                    <span className="text-sm font-bold text-white/40 flex justify-center">{index + 1}</span>

                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        placeholder="0"
                                        value={set.weight}
                                        onChange={(e) => updateSet(set.id, 'weight', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 text-center text-white font-medium focus:border-primary focus:outline-none transition-colors placeholder:text-white/10 p-0"
                                    />

                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        placeholder="0"
                                        value={set.reps}
                                        onChange={(e) => updateSet(set.id, 'reps', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 text-center text-white font-medium focus:border-primary focus:outline-none transition-colors placeholder:text-white/10 p-0"
                                    />

                                    <div className="flex items-center justify-center">
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
                            </SwipeableSetRow>
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
                            className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-full text-xs font-bold text-primary transition-colors border border-primary/20 hover:border-primary/50"
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

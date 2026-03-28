import React, { useState, useRef } from 'react';
import { ChevronDown, Check, Plus, Trash2, ArrowDown, Copy, X } from 'lucide-react';

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

const SwipeableSetRow = ({ children, onDelete, onCopy }) => {
    const [offsetX, setOffsetX] = useState(0);
    const startX = useRef(0);
    const isDragging = useRef(false);

    const onPointerDown = (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        // Ignore inputs/buttons to let them function normally
        if (e.target.closest('input') || e.target.closest('button')) return;

        isDragging.current = true;
        startX.current = e.clientX - offsetX;
        e.target.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
        if (!isDragging.current) return;
        const currentX = e.clientX;
        const diff = currentX - startX.current;
        // Allow swiping left (delete) and right (copy), capped at 100px
        if (diff > -100 && diff < 100) {
            setOffsetX(diff);
        }
    };

    const onPointerUpOrCancel = (e) => {
        if (!isDragging.current) return;
        isDragging.current = false;
        if (e.target.hasPointerCapture(e.pointerId)) {
            e.target.releasePointerCapture(e.pointerId);
        }

        if (offsetX < -50) {
            onDelete();
            setOffsetX(0); 
        } else if (offsetX > 50) {
            onCopy();
            setOffsetX(0);
        } else {
            setOffsetX(0); // Snap back
        }
    };

    return (
        <div className="relative overflow-hidden group/swipe rounded-lg">
            {/* Background Base (reveals depending on swipe direction) */}
            <div className={`absolute inset-0 z-0 transition-opacity duration-200 flex items-center ${offsetX > 0 ? 'bg-green-500/80 justify-start pl-6 opacity-100' : offsetX < 0 ? 'bg-red-500/80 justify-end pr-6 opacity-100' : 'opacity-0'}`}>
                {offsetX > 0 && <Copy className="w-5 h-5 text-white" />}
                {offsetX < 0 && <Trash2 className="w-5 h-5 text-white" />}
            </div>

            {/* Foreground Content */}
            <div
                className="relative z-10 bg-[#111] transition-transform duration-200 ease-out flex items-center rounded-lg w-full"
                style={{ 
                    transform: `translateX(${offsetX}px)`,
                    touchAction: 'pan-y', // allows continuous vertical scrolling natively, prevents horizontal gesture zooming
                    userSelect: 'none' // prevents accidental text highlight while dragging with mouse
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUpOrCancel}
                onPointerCancel={onPointerUpOrCancel}
                onClick={() => offsetX !== 0 && setOffsetX(0)} // Tap anywhere to snap back if stuck
            >
                {children}
            </div>
        </div>
    );
};

const ExerciseCard = ({ exercise, isExpanded, onToggleExpand, onRemove, onUpdateSets, onUpdateExercise, isBuilderMode = false }) => {
    const [isEditingSetCount, setIsEditingSetCount] = useState(false);
    // Sets are now passed in via exercise.sets
    const sets = exercise.sets || [];
    const trackType = exercise.trackType || 'weight_reps';
    const bwType = exercise.bwType || 'bodyweight';

    const showWeight = trackType === 'weight_reps' || trackType === 'weight_time' || (trackType === 'bodyweight_reps' && bwType !== 'bodyweight');
    const showReps = trackType === 'weight_reps' || trackType === 'bodyweight_reps';
    const showDistance = trackType === 'distance_time';
    const showTime = trackType === 'distance_time' || trackType === 'weight_time';
    const showRpe = trackType !== 'distance_time'; 

    let midCols = [];
    if (showWeight) midCols.push('1fr');
    if (showDistance) midCols.push('1fr');
    if (showReps) midCols.push('1fr');
    if (showTime) midCols.push('1fr');
    if (showRpe && !isBuilderMode) midCols.push('1fr');
    if (!isBuilderMode) midCols.push('2rem'); 
    if (isBuilderMode) midCols.push('4rem');

    const gridTemplateColumns = `2rem ${midCols.join(' ')}`;

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
            id: Date.now() + Math.random(),
            weight: isBuilderMode ? '' : (lastSet ? lastSet.weight : ''),
            reps: isBuilderMode ? '' : (lastSet ? lastSet.reps : ''),
            distance: isBuilderMode ? '' : (lastSet ? lastSet.distance : ''),
            time: isBuilderMode ? '' : (lastSet ? lastSet.time : ''),
            rpe: 0,
            completed: false
        };
        onUpdateSets([...sets, newSet]);
    };

    const removeSet = (id) => {
        if (sets.length === 1) {
            onUpdateSets([{
                ...sets[0],
                weight: '',
                reps: '',
                distance: '',
                time: '',
                rpe: 0,
                completed: false
            }]);
        } else {
            onUpdateSets(sets.filter(s => s.id !== id));
        }
    };

    const copySetRow = (index) => {
        const sourceSet = sets[index];
        const newSets = [...sets];
        
        const firstEmptyIndex = newSets.findIndex(s => !s.weight && !s.reps && !s.distance && !s.time);
        
        if (firstEmptyIndex !== -1) {
            newSets[firstEmptyIndex] = {
                ...newSets[firstEmptyIndex],
                weight: sourceSet.weight,
                reps: sourceSet.reps,
                distance: sourceSet.distance,
                time: sourceSet.time
            };
        } else {
            newSets.push({
                id: Date.now() + Math.random(),
                weight: sourceSet.weight,
                reps: sourceSet.reps,
                distance: sourceSet.distance,
                time: sourceSet.time,
                rpe: 0,
                completed: false
            });
        }
        onUpdateSets(newSets);
    };

    const adjustSetCount = (count) => {
        if (count < 1 || count > 10) return;
        const newSets = [];
        for (let i = 0; i < count; i++) {
            if (i < sets.length) {
                newSets.push(sets[i]);
            } else {
                newSets.push({
                    id: Date.now() + i + Math.random(),
                    weight: '',
                    reps: '',
                    distance: '',
                    time: '',
                    rpe: 0,
                    completed: false
                });
            }
        }
        onUpdateSets(newSets);
    };

    return (
        <div className={`bg-[#111] border border-white/10 rounded-[20px] overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-1 ring-primary/50' : ''}`}>
            {/* Header / Collapsed State */}
            <div
                onClick={onToggleExpand}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-4">
                    {isBuilderMode ? (
                        <div 
                            className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-full border border-white/10 shrink-0 cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditingSetCount(true);
                            }}
                        >
                            {isEditingSetCount ? (
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    autoFocus
                                    className="w-full text-center bg-transparent text-white font-bold outline-none appearance-none"
                                    onBlur={(e) => {
                                        setIsEditingSetCount(false);
                                        const count = parseInt(e.target.value);
                                        if (!isNaN(count)) adjustSetCount(count);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') e.target.blur();
                                    }}
                                    defaultValue={sets.length}
                                />
                            ) : (
                                <span className="text-[10px] font-bold text-white uppercase text-center leading-none">{sets.length}<br/>Set{sets.length !== 1 ? 's' : ''}</span>
                            )}
                        </div>
                    ) : (
                        <ProgressCircle total={sets.length} completed={completedSets} />
                    )}
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
                    {/* Bodyweight Toggle */}
                    {trackType === 'bodyweight_reps' && (
                        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10 mb-4 mx-0">
                            {['bodyweight', 'weighted', 'assisted'].map((type) => (
                                <button
                                    key={type}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onUpdateExercise) onUpdateExercise({ bwType: type });
                                    }}
                                    className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${bwType === type ? 'bg-primary text-white shadow-md' : 'text-white/40 hover:text-white/80'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Column Headers */}
                    <div className="grid gap-2 px-0 text-[10px] uppercase tracking-wider text-white/30 font-semibold items-center text-center" style={{ gridTemplateColumns }}>
                        <div className="text-left pl-2">Set</div>
                        {showWeight && <div>{trackType === 'bodyweight_reps' ? (bwType === 'assisted' ? '-lbs' : '+lbs') : 'lbs'}</div>}
                        {showDistance && <div>Dist</div>}
                        {showReps && <div>Reps</div>}
                        {showTime && <div>Time</div>}
                        {showRpe && !isBuilderMode && <div>RPE</div>}
                        {!isBuilderMode && <div>Done</div>}
                        {isBuilderMode && <div className="text-right pr-2">Actions</div>}
                    </div>

                    {/* Sets */}
                    <div className="space-y-3">
                        {sets.map((set, index) => (
                            <SwipeableSetRow key={set.id} onDelete={() => removeSet(set.id)} onCopy={() => copySetRow(index)}>
                                <div key={set.id} className="grid gap-2 items-center w-full bg-[#111] pr-1" style={{ gridTemplateColumns }}>
                                    <span className="text-sm font-bold text-white/40 flex justify-center">{index + 1}</span>

                                    {showWeight && (
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            placeholder="0"
                                            value={set.weight}
                                            onChange={(e) => updateSet(set.id, 'weight', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 text-center text-white font-medium focus:border-primary focus:outline-none transition-colors placeholder:text-white/10 p-0"
                                        />
                                    )}

                                    {showDistance && (
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            placeholder="0"
                                            value={set.distance !== undefined ? set.distance : ''}
                                            onChange={(e) => updateSet(set.id, 'distance', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 text-center text-white font-medium focus:border-primary focus:outline-none transition-colors placeholder:text-white/10 p-0"
                                        />
                                    )}

                                    {showReps && (
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            placeholder="0"
                                            value={set.reps}
                                            onChange={(e) => updateSet(set.id, 'reps', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 text-center text-white font-medium focus:border-primary focus:outline-none transition-colors placeholder:text-white/10 p-0"
                                        />
                                    )}

                                    {showTime && (
                                        <input
                                            type="text"
                                            placeholder="--:--"
                                            value={set.time !== undefined ? set.time : ''}
                                            onChange={(e) => updateSet(set.id, 'time', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 text-center text-white font-medium focus:border-primary focus:outline-none transition-colors placeholder:text-white/10 p-0"
                                        />
                                    )}

                                    {showRpe && !isBuilderMode && (
                                        <div className="flex items-center justify-center">
                                            <RPEBar value={set.rpe} onChange={(val) => updateSet(set.id, 'rpe', val)} />
                                        </div>
                                    )}

                                    {!isBuilderMode && (
                                        <button
                                            onClick={() => toggleSetComplete(set.id)}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all mx-auto ${set.completed
                                                ? 'bg-primary text-white shadow-[0_0_10px_rgba(0,46,93,0.5)]'
                                                : 'bg-white/5 text-transparent border border-white/10 hover:border-primary/50'
                                                }`}
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                    )}

                                    {isBuilderMode && (
                                        <div className="flex items-center justify-end gap-1 w-full pl-1">
                                            <button
                                                title="Duplicate Row"
                                                onClick={() => copySetRow(index)}
                                                className="w-7 h-7 rounded-md flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                title="Delete Row"
                                                onClick={() => removeSet(set.id)}
                                                className="w-7 h-7 rounded-md flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-400/10 active:scale-95 transition-all"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
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

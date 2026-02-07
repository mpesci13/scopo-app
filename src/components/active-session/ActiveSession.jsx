import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, ChevronsDown, ChevronsUp, AlertTriangle } from 'lucide-react';
import { useWorkout } from '../../context/WorkoutContext';
import ExerciseCard from './ExerciseCard';

const ActiveSession = ({ onBack, onAddExercise }) => {
    const { cart, removeFromCart } = useWorkout();

    // Timer Logic
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(s => s + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Global Expand/Collapse Logic
    const [expandedIds, setExpandedIds] = useState(() => new Set(cart.map(item => item.id)));

    // Ensure new items are expanded when added (or when cart changes significantly if we wanted strict sync, but 'on mount' is key for the return trip from directory)
    useEffect(() => {
        // When coming back from directory with new items, we want them expanded.
        // We can just merge all cart IDs into expandedIds to be safe.
        setExpandedIds(prev => {
            const next = new Set(prev);
            cart.forEach(item => next.add(item.id));
            return next;
        });
    }, [cart]);

    const toggleExpand = (id) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedIds(newSet);
    };

    const expandAll = () => {
        const allIds = new Set(cart.map(item => item.id));
        setExpandedIds(allIds);
    };

    const collapseAll = () => {
        setExpandedIds(new Set());
    };

    // Smart Finish Logic (Stub for now)
    const handleFinish = () => {
        // Validation logic will go here
        console.log("Validating session...");
        onBack(); // Temp exit
    };

    return (
        <div className="h-full flex flex-col relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pt-2">
                <button
                    onClick={onBack}
                    className="text-sm font-medium text-red-400 hover:text-red-300 px-2"
                >
                    Cancel
                </button>

                <div className="flex flex-col items-center">
                    <span className="text-2xl font-black text-white tracking-widest font-mono">
                        {formatTime(seconds)}
                    </span>
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                        Active Session
                    </span>
                </div>

                <button
                    onClick={handleFinish}
                    className="text-sm font-bold text-primary hover:text-white transition-colors px-2"
                >
                    Finish
                </button>
            </div>

            {/* Global Controls */}
            {cart.length > 0 && (
                <div className="flex justify-end gap-3 mb-4 px-1">
                    <button
                        onClick={collapseAll}
                        className="p-2 text-white/40 hover:text-white transition-colors"
                        title="Collapse All"
                    >
                        <ChevronsUp className="w-5 h-5" />
                    </button>
                    <button
                        onClick={expandAll}
                        className="p-2 text-white/40 hover:text-white transition-colors"
                        title="Expand All"
                    >
                        <ChevronsDown className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto space-y-4 pb-24 touch-pan-y">
                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="p-4 bg-white/5 rounded-full">
                            <Plus className="w-8 h-8 text-white/20" />
                        </div>
                        <p className="text-white/40">Tap '+' to build your workout.</p>
                    </div>
                ) : (
                    cart.map(exercise => (
                        <ExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            isExpanded={expandedIds.has(exercise.id)}
                            onToggleExpand={() => toggleExpand(exercise.id)}
                            onRemove={() => removeFromCart(exercise.id)}
                        />
                    ))
                )}
            </div>

            {/* Floating Action Button */}
            <div className="absolute bottom-6 right-2 left-2 flex justify-center z-10">
                <button
                    onClick={onAddExercise}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-bold shadow-[0_4px_20px_rgba(0,46,93,0.5)] hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Add Exercise
                </button>
            </div>
        </div>
    );
};

export default ActiveSession;

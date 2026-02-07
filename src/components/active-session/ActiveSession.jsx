import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, ChevronsDown, ChevronsUp, AlertTriangle, Play, X as XIcon } from 'lucide-react';
import { useWorkout } from '../../context/WorkoutContext';
import ExerciseCard from './ExerciseCard';

const ActiveSession = ({ onBack, onAddExercise, onFinishSession }) => {
    const { cart, removeFromCart, updateCartItem, saveTemplate, addLog, clearCart } = useWorkout();
    const [showFinishModal, setShowFinishModal] = useState(false);

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

    useEffect(() => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            cart.forEach(item => next.add(item.id));
            return next;
        });
    }, [cart.length]);

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

    // Finish Logic
    const getIncompleteItems = () => {
        let count = 0;
        cart.forEach(ex => {
            if (ex.sets) {
                ex.sets.forEach(s => {
                    if (!s.completed || !s.weight || !s.reps) {
                        count++;
                    }
                });
            }
        });
        return count;
    };

    const handleFinishClick = () => {
        const incompleteCount = getIncompleteItems();
        if (incompleteCount > 0) {
            setShowFinishModal(true);
        } else {
            finalizeWorkout();
        }
    };

    const finalizeWorkout = () => {
        // Prune empty/unchecked sets
        const prunedCart = cart.map(ex => ({
            ...ex,
            sets: ex.sets ? ex.sets.filter(s => s.completed && s.weight && s.reps) : []
        })).filter(ex => ex.sets.length > 0);

        // Calculate Stats
        let volume = 0;
        let totalSets = 0;
        prunedCart.forEach(ex => {
            ex.sets.forEach(s => {
                volume += (parseFloat(s.weight) || 0) * (parseFloat(s.reps) || 0);
                totalSets++;
            });
        });

        // Add to logs (using context)
        prunedCart.forEach(ex => {
            ex.sets.forEach(set => {
                addLog({
                    exercise: ex.name,
                    weight: set.weight,
                    reps: set.reps,
                    rpe: set.rpe,
                    date: new Date().toISOString()
                });
            });
        });

        const stats = {
            time: formatTime(seconds),
            volume,
            sets: totalSets
        };

        // Notify parent
        onFinishSession(stats);
    };

    const [showCancelModal, setShowCancelModal] = useState(false);

    // Cancel Logic
    const handleCancelClick = () => {
        setShowCancelModal(true);
    };

    const confirmCancel = () => {
        clearCart();
        onBack();
    };

    return (
        <div className="fixed inset-0 flex flex-col bg-[#0a0a0a] z-50">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 pt-12 border-b border-white/5 bg-[#0a0a0a] z-10">
                <button
                    onClick={handleCancelClick}
                    className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                >
                    Cancel
                </button>

                <div className="flex flex-col items-center">
                    <span className="text-2xl font-black text-white tracking-widest font-mono leading-none">
                        {formatTime(seconds)}
                    </span>
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                        Active Session
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleFinishClick}
                        className="text-sm font-bold text-primary hover:text-white transition-colors"
                    >
                        Finish
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-1"></div>
                    <button
                        onClick={collapseAll}
                        className="text-white/40 hover:text-white transition-colors"
                        title="Collapse All"
                    >
                        <ChevronsUp className="w-5 h-5" />
                    </button>
                    <button
                        onClick={expandAll}
                        className="text-white/40 hover:text-white transition-colors"
                        title="Expand All"
                    >
                        <ChevronsDown className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto space-y-4 p-4 pb-48 touch-pan-y">
                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="p-4 bg-white/5 rounded-full">
                            <Plus className="w-8 h-8 text-white/20" />
                        </div>
                        <p className="text-white/40">Tap '+ Add Exercise' below to start.</p>
                    </div>
                ) : (
                    cart.map(exercise => (
                        <ExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            isExpanded={expandedIds.has(exercise.id)}
                            onToggleExpand={() => toggleExpand(exercise.id)}
                            onRemove={() => removeFromCart(exercise.id)}
                            onUpdateSets={(newSets) => updateCartItem(exercise.id, { sets: newSets })}
                        />
                    ))
                )}

                {/* Inline Footer Actions */}
                <div className="mt-8 flex flex-col gap-3">
                    <button
                        onClick={onAddExercise}
                        className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add Exercise
                    </button>

                    <div className="grid grid-cols-[1fr_2fr] gap-3">
                        <button
                            onClick={handleCancelClick}
                            className="py-4 border border-red-500/20 text-red-400 font-bold rounded-2xl text-sm transition-colors hover:bg-red-500/10"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleFinishClick}
                            className="py-4 bg-[#002E5D] text-white font-bold rounded-2xl text-sm uppercase tracking-wide shadow-lg active:scale-95 transition-all"
                        >
                            Finish Workout
                        </button>
                    </div>
                </div>
            </div>

            {/* Finish Confirmation Modal - Fixed Centered */}
            {showFinishModal && (
                <div className="fixed inset-0 flex items-center justify-center z-[60] bg-black/80 backdrop-blur-sm animate-fade-in p-6">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl relative">
                        <button
                            onClick={() => setShowFinishModal(false)}
                            className="absolute top-4 right-4 text-white/20 hover:text-white"
                        >
                            <XIcon className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3 text-yellow-500">
                            <AlertTriangle className="w-6 h-6" />
                            <h3 className="text-lg font-bold">Unfinished Sets</h3>
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed">
                            You have empty or unchecked sets. Finishing now will
                            <strong className="text-white"> remove them</strong> from your history.
                        </p>
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={finalizeWorkout}
                                className="flex-1 py-3 bg-primary hover:bg-primary/80 text-white rounded-xl font-bold transition-colors shadow-lg text-center"
                            >
                                Finish Anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm animate-fade-in p-6">
                    <div className="bg-[#1a1a1a] border border-RED-500/20 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl relative">
                        <div className="flex items-center gap-3 text-red-500">
                            <AlertTriangle className="w-6 h-6" />
                            <h3 className="text-lg font-bold">Cancel Workout?</h3>
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Are you sure? This will <strong className="text-white">delete all progress</strong> from this session.
                        </p>
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                            >
                                No, Keep Going
                            </button>
                            <button
                                onClick={confirmCancel}
                                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors shadow-lg"
                            >
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActiveSession;

import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

const QuickLog = () => {
    const { addLog, exerciseHistory } = useWorkout();

    const [exercise, setExercise] = useState('');
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const exerciseInputRef = useRef(null);

    // Suggestions logic
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestions = exerciseHistory.filter(ex =>
        ex.toLowerCase().includes(exercise.toLowerCase()) &&
        ex.toLowerCase() !== exercise.toLowerCase()
    ).slice(0, 5);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        // Validation Guard
        if (!exercise.trim()) {
            setError('exercise');
            return;
        }
        if (!weight || Number(weight) <= 0) {
            setError('weight');
            return;
        }
        if (!reps || Number(reps) <= 0) {
            setError('reps');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        // Fire & Forget logic
        addLog({
            exercise: exercise.trim(),
            weight: Number(weight),
            reps: Number(reps)
        });

        // Instant Reset & Feedback
        setWeight('');
        setReps('');
        // Keep exercise name for convenient multi-set logging, or clear it?
        // "Quick-Log" usually implies logging a specific set. Keeping exercise name is usually better UX.
        // However, to be "pristine", let's clear it or create a "next set" flow.
        // For now, let's CLEAR it to prove the "Fire & Forget" cycle, unless user asks otherwise.
        // actually, most users want to log multiple sets. Let's KEEP the exercise name but select the weight/reps?
        // Let's stick to "Fire & Forget" = Clear All for now to ensure "fresh start" feeling.
        // Wait, typical gym flow is: Do set 1 -> Log. Rest. Do set 2 -> Log.
        // You rarely change exercises immediately.
        // I will KEEP the exercise name but clear weight/reps, and focus weight. 
        // Actually, let's CLEAR EVERYTHING for the "Elite" feeling of "Task Done".
        // If I clear everything, I need that autocomplete to be fast.
        setExercise('');

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);

        setIsSubmitting(false);

        // Refocus exercise for next entry
        if (exerciseInputRef.current) {
            exerciseInputRef.current.focus();
        }
    };

    const handleExerciseSelect = (value) => {
        setExercise(value);
        setShowSuggestions(false);
    };

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 1000); // clear error shake after animation
            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        <div className="w-full relative z-20">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 items-start md:items-center">

                {/* Exercise Input with Autocomplete */}
                <div className="relative flex-1 w-full group">
                    <input
                        ref={exerciseInputRef}
                        type="text"
                        value={exercise}
                        onChange={(e) => {
                            setExercise(e.target.value);
                            setShowSuggestions(true);
                            setError(null);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                        placeholder="Exercise Name"
                        className={`w-full bg-[#0a0a0a] border ${error === 'exercise' ? 'border-red-500 animate-pulse' : 'border-white/10 focus:border-primary'} text-white rounded-lg px-4 py-3 outline-none transition-all placeholder:text-white/20`}
                    />
                    {/* Autocomplete Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#111] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                            {suggestions.map((s, i) => (
                                <div
                                    key={i}
                                    className="px-4 py-2 hover:bg-white/5 cursor-pointer text-sm text-white/80"
                                    onClick={() => handleExerciseSelect(s)}
                                >
                                    {s}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    {/* Weight Input */}
                    <div className="relative w-full md:w-32">
                        <input
                            type="number"
                            value={weight}
                            onChange={(e) => {
                                setWeight(e.target.value);
                                setError(null);
                            }}
                            placeholder="Lbs"
                            className={`w-full bg-[#0a0a0a] border ${error === 'weight' ? 'border-red-500 animate-pulse' : 'border-white/10 focus:border-primary'} text-white rounded-lg px-4 py-3 outline-none transition-all placeholder:text-white/20 appearance-none`}
                        />
                    </div>

                    {/* Reps Input */}
                    <div className="relative w-full md:w-24">
                        <input
                            type="number"
                            value={reps}
                            onChange={(e) => {
                                setReps(e.target.value);
                                setError(null);
                            }}
                            placeholder="Reps"
                            className={`w-full bg-[#0a0a0a] border ${error === 'reps' ? 'border-red-500 animate-pulse' : 'border-white/10 focus:border-primary'} text-white rounded-lg px-4 py-3 outline-none transition-all placeholder:text-white/20 appearance-none`}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className={`h-[50px] px-6 rounded-lg font-medium flex items-center justify-center gap-2 min-w-[120px] transition-all duration-300 ${showSuccess
                            ? 'bg-green-500/10 text-green-500 border border-green-500/50'
                            : 'bg-primary text-white hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                >
                    {showSuccess ? (
                        <> <Check className="w-5 h-5" /> Saved </>
                    ) : (
                        <> <Plus className="w-5 h-5" /> Log Set </>
                    )}
                </button>
            </form>

            {/* Validation Message (Optional, keeping it stealth usually means minimal text, but error state borders handle it. maybe a toast?) */}
        </div>
    );
};

export default QuickLog;

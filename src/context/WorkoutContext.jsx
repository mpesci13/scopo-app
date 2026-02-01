import { createContext, useContext, useState, useEffect, useRef } from 'react';

const WorkoutContext = createContext();

export function WorkoutProvider({ children }) {
    // --- Cart State ---
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem('scopo-cart');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch (e) {
            return new Set();
        }
    });

    useEffect(() => {
        const array = Array.from(cart);
        localStorage.setItem('scopo-cart', JSON.stringify(array));
    }, [cart]);

    const toggleExercise = (id) => {
        setCart(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const clearCart = () => setCart(new Set());

    // --- Session State ---
    const [session, setSession] = useState(() => {
        try {
            const saved = localStorage.getItem('scopo-session');
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });

    const [restTimer, setRestTimer] = useState(null);

    // Persist session
    useEffect(() => {
        if (session) {
            localStorage.setItem('scopo-session', JSON.stringify(session));
        } else {
            localStorage.removeItem('scopo-session');
        }
    }, [session]);

    // Timer Tick
    useEffect(() => {
        if (!restTimer) return;
        const interval = setInterval(() => {
            const elapsed = (Date.now() - restTimer.startTime) / 1000;
            if (elapsed >= restTimer.duration) {
                setRestTimer(null); // Timer finished
            }
        }, 500);
        return () => clearInterval(interval);
    }, [restTimer]);

    const startSession = (selectedIds) => {
        // If we already have a session, don't overwrite if it's the same exercises?
        // For now, always start fresh if explicitly called, or logic handles updates.
        // In this flow, we assume startSession is called when hitting "Play" on cart.

        // Check if we have an active session that matches?
        // For simplicity, if session is null, start new.
        if (session) return;

        const exercises = {};
        selectedIds.forEach(id => {
            exercises[id] = [{ id: Date.now() + Math.random(), weight: '', reps: '', completed: false }];
        });

        setSession({
            startTime: Date.now(),
            exercises
        });
    };

    const updateSet = (exId, setIndex, field, value) => {
        setSession(prev => {
            if (!prev) return null;
            const newEx = { ...prev.exercises };
            const sets = [...newEx[exId]];
            sets[setIndex] = { ...sets[setIndex], [field]: value };
            newEx[exId] = sets;
            return { ...prev, exercises: newEx };
        });
    };

    const completeSet = (exId, setIndex) => {
        setSession(prev => {
            if (!prev) return null;
            const newEx = { ...prev.exercises };
            const sets = [...newEx[exId]];
            const isCompleting = !sets[setIndex].completed;

            sets[setIndex] = { ...sets[setIndex], completed: isCompleting };
            newEx[exId] = sets;

            if (isCompleting) {
                // Trigger 60s timer
                setRestTimer({ startTime: Date.now(), duration: 60 });

                // Auto-add next set if this was the last one
                if (setIndex === sets.length - 1) {
                    const prevSet = sets[setIndex];
                    sets.push({
                        id: Date.now() + Math.random(),
                        weight: prevSet.weight,
                        reps: prevSet.reps,
                        completed: false
                    });
                }
            }

            return { ...prev, exercises: newEx };
        });
    };

    const endSession = () => {
        const finalSession = session;
        setSession(null);
        setRestTimer(null);
        clearCart();
        return finalSession;
    };

    return (
        <WorkoutContext.Provider value={{
            cart,
            toggleExercise,
            clearCart,
            count: cart.size,
            session,
            startSession,
            updateSet,
            completeSet,
            endSession,
            restTimer
        }}>
            {children}
        </WorkoutContext.Provider>
    );
}

export function useWorkout() {
    const context = useContext(WorkoutContext);
    if (!context) {
        throw new Error('useWorkout must be used within a WorkoutProvider');
    }
    return context;
}

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

    // --- Frequency State ---
    const [exerciseFrequency, setExerciseFrequency] = useState(() => {
        try {
            const saved = localStorage.getItem('scopo-frequency');
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    });

    useEffect(() => {
        localStorage.setItem('scopo-frequency', JSON.stringify(exerciseFrequency));
    }, [exerciseFrequency]);

    const incrementFrequency = (ids) => {
        setExerciseFrequency(prev => {
            const next = { ...prev };
            ids.forEach(id => {
                next[id] = (next[id] || 0) + 1;
            });
            return next;
        });
    };

    // --- Template State ---
    const [templates, setTemplates] = useState(() => {
        try {
            const saved = localStorage.getItem('scopo-templates');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    useEffect(() => {
        localStorage.setItem('scopo-templates', JSON.stringify(templates));
    }, [templates]);

    const deleteTemplate = (id) => {
        setTemplates(prev => prev.filter(t => t.id !== id));
    };

    // --- Folder State ---
    const [folders, setFolders] = useState(() => {
        try {
            const saved = localStorage.getItem('scopo-folders');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    useEffect(() => {
        localStorage.setItem('scopo-folders', JSON.stringify(folders));
    }, [folders]);

    const createFolder = (name) => {
        const newFolder = {
            id: Date.now().toString(),
            name,
            createdAt: Date.now()
        };
        setFolders(prev => [...prev, newFolder]);
        return newFolder.id;
    };

    const deleteFolder = (id) => {
        setFolders(prev => prev.filter(f => f.id !== id));
        // Also delete or move templates? For now, keep them or move to 'Uncategorized' (null folderId)
        setTemplates(prev => prev.map(t => t.folderId === id ? { ...t, folderId: null } : t));
    };

    // Update saveTemplate to accept folderId
    const saveTemplate = (name, exerciseIds, folderId = null) => {
        const newTemplate = {
            id: Date.now().toString(),
            name,
            exercises: exerciseIds,
            folderId,
            createdAt: Date.now()
        };
        setTemplates(prev => [...prev, newTemplate]);
    };

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

    // --- Timer State ---
    // --- Timer State ---
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
        if (session) return;

        const exercises = {};
        const exerciseSettings = {};

        selectedIds.forEach(id => {
            exercises[id] = [{ id: Date.now() + Math.random(), weight: '', reps: '', completed: false }];
            // Default: Timer OFF, 60s duration
            exerciseSettings[id] = { timerEnabled: false, timerDuration: 60 };
        });

        setSession({
            startTime: Date.now(),
            exercises,
            exerciseSettings
        });
    };

    const addSet = (exId) => {
        setSession(prev => {
            if (!prev) return null;
            const newEx = { ...prev.exercises };
            const sets = [...newEx[exId]];

            // Clone previous set values if available, else empty
            const prevSet = sets[sets.length - 1];
            sets.push({
                id: Date.now() + Math.random(),
                weight: prevSet ? prevSet.weight : '',
                reps: prevSet ? prevSet.reps : '',
                completed: false
            });

            newEx[exId] = sets;
            return { ...prev, exercises: newEx };
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

    const updateExerciseSettings = (exId, settings) => {
        setSession(prev => {
            if (!prev) return null;
            const newSettings = { ...prev.exerciseSettings };
            newSettings[exId] = { ...newSettings[exId], ...settings };
            return { ...prev, exerciseSettings: newSettings };
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
                const settings = prev.exerciseSettings ? prev.exerciseSettings[exId] : { timerEnabled: false, timerDuration: 60 };

                if (settings.timerEnabled) {
                    // Trigger timer with specific duration
                    setRestTimer({ startTime: Date.now(), duration: settings.timerDuration });
                }
            }

            return { ...prev, exercises: newEx };
        });
    };

    const endSession = () => {
        const finalSession = session;

        // Track frequency of exercises used in this session
        if (finalSession && finalSession.exercises) {
            incrementFrequency(Object.keys(finalSession.exercises));
        }

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
            addSet,
            updateSet,
            completeSet,
            endSession,
            restTimer,

            exerciseFrequency,
            templates,
            saveTemplate,
            deleteTemplate,
            folders,
            createFolder,
            deleteFolder
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

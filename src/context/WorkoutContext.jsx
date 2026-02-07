import React, { createContext, useContext, useEffect, useState } from 'react';

const WorkoutContext = createContext();

export const useWorkout = () => {
    const context = useContext(WorkoutContext);
    if (!context) {
        throw new Error('useWorkout must be used within a WorkoutProvider');
    }
    return context;
};

export const WorkoutProvider = ({ children }) => {
    const [logs, setLogs] = useState(() => {
        const saved = localStorage.getItem('scopo_logs');
        return saved ? JSON.parse(saved) : [];
    });

    const [exerciseHistory, setExerciseHistory] = useState(() => {
        const saved = localStorage.getItem('scopo_exercises');
        return saved ? JSON.parse(saved) : [];
    });

    // Initial default exercises
    const DEFAULT_EXERCISES = [
        { id: 'bp_bb', name: 'Bench Press (Barbell)', category: 'Chest' },
        { id: 'inc_bb_bp', name: 'Incline Bench Press (Barbell)', category: 'Chest' },
        { id: 'pushups', name: 'Pushups', category: 'Chest' },
        { id: 'dips', name: 'Tricep Dips', category: 'Triceps' },
        { id: 'skull_crushers', name: 'Skull Crushers', category: 'Triceps' },
        { id: 'sq_bb', name: 'Squat (Barbell)', category: 'Legs' },
        { id: 'dl_bb', name: 'Deadlift (Barbell)', category: 'Back' },
        { id: 'ohp_bb', name: 'Overhead Press (Barbell)', category: 'Shoulders' },
        { id: 'pullup', name: 'Pull Up', category: 'Back' },
        { id: 'db_row', name: 'Dumbbell Row', category: 'Back' },
        { id: 'inc_db_bp', name: 'Incline Bench Press (Dumbbell)', category: 'Chest' },
        { id: 'lat_raise', name: 'Lateral Raise', category: 'Shoulders' },
        { id: 'leg_press', name: 'Leg Press', category: 'Legs' },
        { id: 'rdl_bb', name: 'Romanian Deadlift (Barbell)', category: 'Legs' },
    ];

    const [exercises, setExercises] = useState(() => {
        // Merge defaults with any custom saved ones if we add that feature later
        // For now, just defaults.
        return DEFAULT_EXERCISES;
    });

    const [cart, setCart] = useState([]);

    const [templates, setTemplates] = useState(() => {
        const saved = localStorage.getItem('scopo_templates');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('scopo_logs', JSON.stringify(logs));
    }, [logs]);

    useEffect(() => {
        localStorage.setItem('scopo_exercises', JSON.stringify(exerciseHistory));
    }, [exerciseHistory]);

    useEffect(() => {
        localStorage.setItem('scopo_templates', JSON.stringify(templates));
    }, [templates]);

    // Routines & Templates
    const [routines, setRoutines] = useState(() => {
        const saved = localStorage.getItem('scopo_routines_v2');
        if (saved) return JSON.parse(saved);

        // Default Seed Data
        return [
            { id: 'mon', name: 'Monday: Legs', templates: [] },
            {
                id: 'tue',
                name: 'Tuesday: Chest & Tris',
                templates: [
                    {
                        id: 'barbell_focus',
                        name: 'Barbell Focus',
                        exercises: [
                            { id: 'bp_bb', name: 'Bench Press (Barbell)', category: 'Chest' },
                            { id: 'inc_bb_bp', name: 'Incline Bench Press (Barbell)', category: 'Chest' },
                            { id: 'pushups', name: 'Pushups', category: 'Chest' },
                            { id: 'dips', name: 'Tricep Dips', category: 'Triceps' },
                            { id: 'skull_crushers', name: 'Skull Crushers', category: 'Triceps' }
                        ],
                        createdAt: new Date().toISOString()
                    }
                ]
            },
            { id: 'wed', name: 'Wednesday: Back / Pull', templates: [] },
            { id: 'thu', name: 'Thursday: Glutes/Hamstrings', templates: [] }
        ];
    });

    useEffect(() => {
        localStorage.setItem('scopo_routines_v2', JSON.stringify(routines));
    }, [routines]);

    const addRoutine = (name) => {
        const newRoutine = { id: Date.now(), name, templates: [] };
        setRoutines(prev => [...prev, newRoutine]);
    };

    const addLog = (log) => {
        const newLog = { ...log, id: Date.now(), timestamp: new Date().toISOString() };

        // Optimistic update
        setLogs((prev) => [newLog, ...prev]);

        // Update history if new unique exercise
        setExerciseHistory((prev) => {
            const exists = prev.some(ex => ex.toLowerCase() === log.exercise.toLowerCase());
            if (!exists) {
                return [...prev, log.exercise].sort();
            }
            return prev;
        });
    };

    // Actions
    const addToCart = (exercise) => {
        // Avoid duplicates for now? Or allow multiple sets? 
        // Usually a routine has unique exercises.
        if (!cart.find(item => item.id === exercise.id)) {
            setCart(prev => [...prev, exercise]);
        }
    };

    const removeFromCart = (exerciseId) => {
        setCart(prev => prev.filter(item => item.id !== exerciseId));
    };

    const clearCart = () => setCart([]);

    const reorderCart = (fromIndex, toIndex) => {
        const newCart = [...cart];
        const [movedItem] = newCart.splice(fromIndex, 1);
        newCart.splice(toIndex, 0, movedItem);
        setCart(newCart);
    };

    const saveTemplate = (name) => {
        if (!name.trim() || cart.length === 0) return;
        const newTemplate = {
            id: Date.now(),
            name,
            exercises: cart,
            createdAt: new Date().toISOString()
        };
        setTemplates(prev => [...prev, newTemplate]);
        return newTemplate;
    };

    return (
        <WorkoutContext.Provider value={{
            logs,
            exerciseHistory,
            addLog,
            exercises,
            cart,
            addToCart,
            removeFromCart,
            clearCart,
            reorderCart,
            templates,
            saveTemplate,
            routines,
            addRoutine
        }}>
            {children}
        </WorkoutContext.Provider>
    );
};

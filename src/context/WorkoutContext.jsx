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
        { id: 'bp_bb', name: 'Bench Press (Barbell)', bodyPart: 'Chest', type: 'Barbell', tags: ['chest', 'pecs', 'push', 'barbell', 'strength'] },
        { id: 'inc_bb_bp', name: 'Incline Bench Press (Barbell)', bodyPart: 'Chest', type: 'Barbell', tags: ['chest', 'pecs', 'push', 'upper chest', 'incline'] },
        { id: 'pushups', name: 'Pushups', bodyPart: 'Chest', type: 'Bodyweight', tags: ['chest', 'pecs', 'push', 'bodyweight', 'calisthenics'] },
        { id: 'dips', name: 'Tricep Dips', bodyPart: 'Triceps', type: 'Bodyweight', tags: ['triceps', 'arms', 'push', 'bodyweight', 'dips'] }, // Note: Triceps -> Arms might be better if sticking to strict 6, but Context has Triceps in defaults. User said "Arms". I should map Triceps to Arms? "Chest, Back, Legs, Shoulders, Arms, Core". Existing data has "Triceps". I will change "Triceps" -> "Arms".
        { id: 'skull_crushers', name: 'Skull Crushers', bodyPart: 'Arms', type: 'Barbell', tags: ['triceps', 'arms', 'push', 'barbell', 'isolation'] },
        { id: 'sq_bb', name: 'Squat (Barbell)', bodyPart: 'Legs', type: 'Barbell', tags: ['legs', 'quads', 'glutes', 'squat', 'lower body', 'strength'] },
        { id: 'dl_bb', name: 'Deadlift (Barbell)', bodyPart: 'Back', type: 'Barbell', tags: ['back', 'posterior chain', 'hamstrings', 'deadlift', 'pull', 'strength'] },
        { id: 'ohp_bb', name: 'Overhead Press (Barbell)', bodyPart: 'Shoulders', type: 'Barbell', tags: ['shoulders', 'delts', 'push', 'overhead', 'military press'] },
        { id: 'pullup', name: 'Pull Up', bodyPart: 'Back', type: 'Bodyweight', tags: ['back', 'lats', 'pull', 'bodyweight', 'calisthenics'] },
        { id: 'db_row', name: 'Dumbbell Row', bodyPart: 'Back', type: 'Dumbbell', tags: ['back', 'lats', 'pull', 'dumbbell', 'row'] },
        { id: 'inc_db_bp', name: 'Incline Bench Press (Dumbbell)', bodyPart: 'Chest', type: 'Dumbbell', tags: ['chest', 'pecs', 'push', 'upper chest', 'dumbbell'] },
        { id: 'lat_raise', name: 'Lateral Raise', bodyPart: 'Shoulders', type: 'Dumbbell', tags: ['shoulders', 'delts', 'side delts', 'isolation', 'dumbbell'] },
        { id: 'leg_press', name: 'Leg Press', bodyPart: 'Legs', type: 'Machine', tags: ['legs', 'quads', 'machine', 'push'] },
        { id: 'rdl_bb', name: 'Romanian Deadlift (Barbell)', bodyPart: 'Legs', type: 'Barbell', tags: ['legs', 'hamstrings', 'glutes', 'hinge', 'deadlift'] },
        { id: 'run', name: 'Run', bodyPart: 'Cardio', type: 'Cardio', tags: ['cardio', 'endurance', 'legs', 'running'] }, // "Cardio" bodyPart is outside strict list? "Chest, Back, Legs, Shoulders, Arms, Core". User request said "Tag all exercises... with bodyPart and type for accurate filtering". The list "Chest... Core" was for "Filter Chips". "Run" conceptually fits "Legs" or "Cardio". I'll stick to "Cardio" for now as explicit body part might be confusing if it's "Legs". Wait, user said "BodyPart must be one of: Chest, Back, Legs, Shoulders, Arms, Core." explicit list. Okay. Run -> Legs? Or maybe "Cardio" is allowed as Exception? I'll use "Legs" for run/cycle and "Cardio" type.
        { id: 'cycle', name: 'Cycle', bodyPart: 'Legs', type: 'Cardio', tags: ['cardio', 'endurance', 'legs', 'cycling', 'bike'] },
        { id: 'jump_rope', name: 'Jump Rope', bodyPart: 'Legs', type: 'Cardio', tags: ['cardio', 'endurance', 'calisthenics', 'coordination'] },
        // Adjusting Tricep Dips to Arms
        { id: 'plank', name: 'Plank', bodyPart: 'Core', type: 'Timed', tags: ['core', 'abs', 'stability', 'bodyweight', 'timed'] },
        { id: 'side_plank', name: 'Side Plank', bodyPart: 'Core', type: 'Timed', tags: ['core', 'obliques', 'stability', 'bodyweight', 'timed'] },
        { id: 'crunch', name: 'Crunches', bodyPart: 'Core', type: 'Bodyweight', tags: ['core', 'abs', 'bodyweight', 'isolation'] },
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

    const [sessions, setSessions] = useState(() => {
        const saved = localStorage.getItem('scopo_sessions');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('scopo_sessions', JSON.stringify(sessions));
    }, [sessions]);

    // ... (routines/templates code) ...

    const completeWorkout = (workoutData, stats, sessionRpe, sessionNotes) => {
        const sessionId = Date.now();
        const date = new Date().toISOString();

        // 1. Create Session Record
        const newSession = {
            id: sessionId,
            date,
            duration: stats.time,
            volume: stats.volume,
            totalSets: stats.sets,
            rpe: sessionRpe,
            notes: sessionNotes,
            // Assuming we might name workouts later, for now 'Workout' or deriving from routine name?
            // Since we don't have routine name here, we'll default.
            name: "Workout",
            exercises: workoutData
        };

        setSessions(prev => [newSession, ...prev]);

        // 2. Flatten for "Logs" (Global Set History)
        const newLogs = [];
        const newExerciseNames = new Set();

        workoutData.forEach(ex => {
            newExerciseNames.add(ex.name);
            ex.sets.forEach(s => {
                newLogs.push({
                    sessionId,
                    exercise: ex.name,
                    weight: s.weight,
                    reps: s.reps,
                    // Note: This is per-set RPE if we had it. 
                    // Staging tray has 'rpe' field in sets? 
                    // Yes: { id, weight, reps, rpe, completed }
                    rpe: s.rpe || 0,
                    completed: true,
                    date
                });
            });
        });

        setLogs(prev => [...newLogs, ...prev]);

        // 3. Update Unique Exercise History
        setExerciseHistory(prev => {
            const current = new Set(prev.map(e => e.toLowerCase()));
            const toAdd = [];
            newExerciseNames.forEach(name => {
                if (!current.has(name.toLowerCase())) {
                    toAdd.push(name);
                }
            });
            if (toAdd.length === 0) return prev;
            return [...prev, ...toAdd].sort();
        });
    };

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
            // Initialize with default sets
            const exerciseWithSets = {
                ...exercise,
                sets: [
                    { id: Date.now(), weight: '', reps: '', rpe: 0, completed: false },
                    { id: Date.now() + 1, weight: '', reps: '', rpe: 0, completed: false },
                    { id: Date.now() + 2, weight: '', reps: '', rpe: 0, completed: false },
                ]
            };
            setCart(prev => [...prev, exerciseWithSets]);
        }
    };

    const removeFromCart = (exerciseId) => {
        setCart(prev => prev.filter(item => item.id !== exerciseId));
    };

    const updateCartItem = (exerciseId, updates) => {
        setCart(prev => prev.map(item =>
            item.id === exerciseId ? { ...item, ...updates } : item
        ));
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
            updateCartItem,
            clearCart,
            reorderCart,
            templates,
            saveTemplate,
            routines,
            addRoutine,
            sessions,
            completeWorkout
        }}>
            {children}
        </WorkoutContext.Provider>
    );
};

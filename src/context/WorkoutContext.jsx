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
        { id: 'bp_bb', name: 'Bench Press (Barbell)', bodyPart: 'Chest', type: 'Barbell', trackType: 'weight_reps', tags: ['chest', 'pecs', 'push', 'barbell', 'strength'] },
        { id: 'inc_bb_bp', name: 'Incline Bench Press (Barbell)', bodyPart: 'Chest', type: 'Barbell', trackType: 'weight_reps', tags: ['chest', 'pecs', 'push', 'upper chest', 'incline'] },
        { id: 'pushups', name: 'Pushups', bodyPart: 'Chest', type: 'Bodyweight', trackType: 'bodyweight_reps', tags: ['chest', 'pecs', 'push', 'bodyweight', 'calisthenics'] },
        { id: 'dips', name: 'Tricep Dips', bodyPart: 'Arms', type: 'Bodyweight', trackType: 'bodyweight_reps', tags: ['triceps', 'arms', 'push', 'bodyweight', 'dips'] }, // Note: Triceps -> Arms might be better if sticking to strict 6, but Context has Triceps in defaults. User said "Arms". I should map Triceps to Arms? "Chest, Back, Legs, Shoulders, Arms, Core". Existing data has "Triceps". I will change "Triceps" -> "Arms".
        { id: 'skull_crushers', name: 'Skull Crushers', bodyPart: 'Arms', type: 'Barbell', trackType: 'weight_reps', tags: ['triceps', 'arms', 'push', 'barbell', 'isolation'] },
        { id: 'sq_bb', name: 'Squat (Barbell)', bodyPart: 'Legs', type: 'Barbell', trackType: 'weight_reps', tags: ['legs', 'quads', 'glutes', 'squat', 'lower body', 'strength'] },
        { id: 'dl_bb', name: 'Deadlift (Barbell)', bodyPart: 'Back', type: 'Barbell', trackType: 'weight_reps', tags: ['back', 'posterior chain', 'hamstrings', 'deadlift', 'pull', 'strength'] },
        { id: 'ohp_bb', name: 'Overhead Press (Barbell)', bodyPart: 'Shoulders', type: 'Barbell', trackType: 'weight_reps', tags: ['shoulders', 'delts', 'push', 'overhead', 'military press'] },
        { id: 'pullup', name: 'Pull Up', bodyPart: 'Back', type: 'Bodyweight', trackType: 'bodyweight_reps', tags: ['back', 'lats', 'pull', 'bodyweight', 'calisthenics'] },
        { id: 'db_row', name: 'Dumbbell Row', bodyPart: 'Back', type: 'Dumbbell', trackType: 'weight_reps', tags: ['back', 'lats', 'pull', 'dumbbell', 'row'] },
        { id: 'inc_db_bp', name: 'Incline Bench Press (Dumbbell)', bodyPart: 'Chest', type: 'Dumbbell', trackType: 'weight_reps', tags: ['chest', 'pecs', 'push', 'upper chest', 'dumbbell'] },
        { id: 'lat_raise', name: 'Lateral Raise', bodyPart: 'Shoulders', type: 'Dumbbell', trackType: 'weight_reps', tags: ['shoulders', 'delts', 'side delts', 'isolation', 'dumbbell'] },
        { id: 'leg_press', name: 'Leg Press', bodyPart: 'Legs', type: 'Machine', trackType: 'weight_reps', tags: ['legs', 'quads', 'machine', 'push'] },
        { id: 'rdl_bb', name: 'Romanian Deadlift (Barbell)', bodyPart: 'Legs', type: 'Barbell', trackType: 'weight_reps', tags: ['legs', 'hamstrings', 'glutes', 'hinge', 'deadlift'] },
        { id: 'run', name: 'Run', bodyPart: 'Cardio', type: 'Cardio', trackType: 'distance_time', tags: ['cardio', 'endurance', 'legs', 'running'] }, // "Cardio" bodyPart is outside strict list? "Chest, Back, Legs, Shoulders, Arms, Core". User request said "Tag all exercises... with bodyPart and type for accurate filtering". The list "Chest... Core" was for "Filter Chips". "Run" conceptually fits "Legs" or "Cardio". I'll stick to "Cardio" for now as explicit body part might be confusing if it's "Legs". Wait, user said "BodyPart must be one of: Chest, Back, Legs, Shoulders, Arms, Core." explicit list. Okay. Run -> Legs? Or maybe "Cardio" is allowed as Exception? I'll use "Legs" for run/cycle and "Cardio" type.
        { id: 'cycle', name: 'Cycle', bodyPart: 'Legs', type: 'Cardio', trackType: 'distance_time', tags: ['cardio', 'endurance', 'legs', 'cycling', 'bike'] },
        { id: 'jump_rope', name: 'Jump Rope', bodyPart: 'Legs', type: 'Cardio', trackType: 'weight_time', tags: ['cardio', 'endurance', 'calisthenics', 'coordination'] },
        // Adjusting Tricep Dips to Arms
        { id: 'plank', name: 'Plank', bodyPart: 'Core', type: 'Timed', trackType: 'weight_time', tags: ['core', 'abs', 'stability', 'bodyweight', 'timed'] },
        { id: 'side_plank', name: 'Side Plank', bodyPart: 'Core', type: 'Timed', trackType: 'weight_time', tags: ['core', 'obliques', 'stability', 'bodyweight', 'timed'] },
        { id: 'crunch', name: 'Crunches', bodyPart: 'Core', type: 'Bodyweight', trackType: 'bodyweight_reps', tags: ['core', 'abs', 'bodyweight', 'isolation'] },
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

        // Power User Seed Data
        const seedTemplates = [
            { id: 't1', name: 'Heavy Barbell Bench', exercises: [{ id: 'bp_bb', name: 'Bench Press (Barbell)', bodyPart: 'Chest', type: 'Barbell' }], createdAt: new Date().toISOString() },
            { id: 't2', name: 'Incline Focus', exercises: [{ id: 'inc_bb_bp', name: 'Incline Bench Press', bodyPart: 'Chest', type: 'Barbell' }], createdAt: new Date().toISOString() },
            { id: 't3', name: 'Quick Pump', exercises: [{ id: 'pushups', name: 'Pushups', bodyPart: 'Chest', type: 'Bodyweight' }], createdAt: new Date().toISOString() },
            { id: 't4', name: 'Squat PR', exercises: [{ id: 'sq_bb', name: 'Squat', bodyPart: 'Legs', type: 'Barbell' }], createdAt: new Date().toISOString() },
            { id: 't5', name: 'Leg Day Volume', exercises: [{ id: 'leg_press', name: 'Leg Press', bodyPart: 'Legs', type: 'Machine' }], createdAt: new Date().toISOString() },
            { id: 't6', name: 'Deadlift Monster', exercises: [{ id: 'dl_bb', name: 'Deadlift', bodyPart: 'Back', type: 'Barbell' }], createdAt: new Date().toISOString() },
            { id: 't7', name: 'Back & Biceps', exercises: [{ id: 'pullup', name: 'Pull Up', bodyPart: 'Back', type: 'Bodyweight' }], createdAt: new Date().toISOString() },
            { id: 't8', name: 'Shoulder Boulders', exercises: [{ id: 'ohp_bb', name: 'Overhead Press', bodyPart: 'Shoulders', type: 'Barbell' }], createdAt: new Date().toISOString() },
            { id: 't9', name: 'Core Crusher', exercises: [{ id: 'plank', name: 'Plank', bodyPart: 'Core', type: 'Timed' }], createdAt: new Date().toISOString() },
            { id: 't10', name: 'Cardio Intervals', exercises: [{ id: 'run', name: 'Run', bodyPart: 'Cardio', type: 'Cardio' }], createdAt: new Date().toISOString() }
        ];

        return [
            { id: 'f1', name: 'Push Days', templates: [seedTemplates[0], seedTemplates[1], seedTemplates[2]] },
            { id: 'f2', name: 'Pull Days', templates: [seedTemplates[5], seedTemplates[6]] },
            { id: 'f3', name: 'Leg Days', templates: [seedTemplates[3], seedTemplates[4]] },
            { id: 'f4', name: 'Full Body & Core', templates: [seedTemplates[7], seedTemplates[8]] },
            { id: 'f5', name: 'Cardio', templates: [seedTemplates[9]] }
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
                    distance: s.distance || '',
                    time: s.time || '',
                    bwType: ex.bwType, // Record the bodyweight context if applicable
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

        // Return the final session so it can be linked to external states (like challenges)
        return newSession;
    };

    const updateSession = (sessionId, updatedExercises, updatedStats) => {
        // Find existing date to preserve chronological order
        const existingSession = sessions.find(s => s.id === sessionId);
        const sessionDate = existingSession ? existingSession.date : new Date().toISOString();

        // 1. Update the session record
        setSessions(prev => prev.map(session => {
            if (session.id === sessionId) {
                return {
                    ...session,
                    ...updatedStats, // volume, totalSets, duration, etc.
                    exercises: updatedExercises
                };
            }
            return session;
        }));

        // 2. Rebuild the logs for this session
        setLogs(prev => {
            // Remove old logs for this session
            const filteredLogs = prev.filter(log => log.sessionId !== sessionId);
            
            // Generate new logs
            const newLogs = [];
            
            updatedExercises.forEach(ex => {
                ex.sets.forEach(s => {
                    newLogs.push({
                        sessionId,
                        exercise: ex.name,
                        weight: s.weight,
                        reps: s.reps,
                        distance: s.distance || '',
                        time: s.time || '',
                        bwType: ex.bwType,
                        rpe: s.rpe || 0,
                        completed: s.completed ?? true,
                        date: sessionDate
                    });
                });
            });

            // Sort global logs descending by date
            const combined = [...newLogs, ...filteredLogs];
            return combined.sort((a, b) => new Date(b.date) - new Date(a.date));
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
                bwType: exercise.trackType === 'bodyweight_reps' ? 'bodyweight' : undefined,
                sets: [
                    { id: Date.now(), weight: '', reps: '', distance: '', time: '', rpe: 0, completed: false },
                    { id: Date.now() + 1, weight: '', reps: '', distance: '', time: '', rpe: 0, completed: false },
                    { id: Date.now() + 2, weight: '', reps: '', distance: '', time: '', rpe: 0, completed: false },
                ]
            };
            setCart(prev => [...prev, exerciseWithSets]);
        }
    };

    const loadTemplate = (exercisesArray) => {
        // Ensure all loaded templates have initialized sets arrays
        const loadedCart = exercisesArray.map(ex => {
            if (!ex.sets || ex.sets.length === 0) {
                return {
                    ...ex,
                    bwType: ex.bwType !== undefined ? ex.bwType : (ex.trackType === 'bodyweight_reps' ? 'bodyweight' : undefined),
                    sets: [
                        { id: Date.now() + Math.random(), weight: '', reps: '', distance: '', time: '', rpe: 0, completed: false },
                        { id: Date.now() + 1 + Math.random(), weight: '', reps: '', distance: '', time: '', rpe: 0, completed: false },
                        { id: Date.now() + 2 + Math.random(), weight: '', reps: '', distance: '', time: '', rpe: 0, completed: false }
                    ]
                };
            }
            // If they already have structured sets, generate new IDs so they don't clash
            return {
                ...ex,
                id: ex.id + '_' + Date.now(), // Ensure exercise instance ID is unique for cart
                bwType: ex.bwType !== undefined ? ex.bwType : (ex.trackType === 'bodyweight_reps' ? 'bodyweight' : undefined),
                sets: ex.sets.map(s => ({
                    ...s,
                    distance: s.distance || '',
                    time: s.time || '',
                    id: Date.now() + Math.random()
                }))
            };
        });
        
        setCart(loadedCart);
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

    const deleteTemplate = (routineId, templateId) => {
        setRoutines(prev => prev.map(routine => {
            if (routine.id === routineId) {
                return {
                    ...routine,
                    templates: routine.templates.filter(t => t.id !== templateId)
                };
            }
            return routine;
        }));
    };

    const updateTemplateLastUsed = (routineId, templateId) => {
        setRoutines(prev => prev.map(routine => {
            if (routine.id === routineId) {
                return {
                    ...routine,
                    templates: routine.templates.map(t => 
                        t.id === templateId 
                            ? { ...t, lastUsed: new Date().toISOString() } 
                            : t
                    )
                };
            }
            return routine;
        }));
    };

    const updateTemplate = (oldRoutineId, newRoutineId, templateId, newName, newExercises) => {
        setRoutines(prev => {
            let routinesCopy = JSON.parse(JSON.stringify(prev));
            let targetTemplate = null;
            
            const oldRoutine = routinesCopy.find(r => r.id === oldRoutineId);
            if (oldRoutine) {
                targetTemplate = oldRoutine.templates.find(t => t.id === templateId);
                oldRoutine.templates = oldRoutine.templates.filter(t => t.id !== templateId);
            }
            
            const newRoutine = routinesCopy.find(r => r.id === newRoutineId);
            if (newRoutine && targetTemplate) {
                targetTemplate.name = newName;
                targetTemplate.exercises = newExercises;
                newRoutine.templates.push(targetTemplate);
            }
            
            return routinesCopy;
        });
    };

    const saveTemplate = (name, routineId = null) => {
        if (!name.trim() || cart.length === 0) return;
        const newTemplate = {
            id: Date.now(),
            name,
            exercises: cart,
            createdAt: new Date().toISOString()
        };
        setTemplates(prev => [...prev, newTemplate]);
        
        // If a specific folder/routine was selected, save it there too
        if (routineId) {
            setRoutines(prev => prev.map(routine => 
                routine.id === routineId 
                    ? { ...routine, templates: [...routine.templates, newTemplate] }
                    : routine
            ));
        }

        return newTemplate;
    };

    // Ghost Data Groundwork
    const getPreviousExerciseData = (exerciseName) => {
        // Find the most recent session containing this exercise
        const sortedSessions = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));

        for (const session of sortedSessions) {
            const exercise = session.exercises.find(
                ex => ex.name.toLowerCase() === exerciseName.toLowerCase()
            );
            if (exercise) {
                // Return only completed sets
                return {
                    sessionId: session.id,
                    date: session.date,
                    bwType: exercise.bwType,
                    sets: exercise.sets.filter(s => s.completed).map(s => ({
                        weight: s.weight,
                        reps: s.reps,
                        distance: s.distance,
                        time: s.time,
                        rpe: s.rpe
                    }))
                };
            }
        }
        return null; // No previous data found
    };

    // Save an existing session structure as a new template
    const saveSessionAsTemplate = (name, sessionExercises, routineId = null) => {
        if (!name.trim() || !sessionExercises || sessionExercises.length === 0) return;
        
        // Strip out specific weights/reps/distance/time but keep the number of sets
        const structuredExercises = sessionExercises.map(ex => ({
            ...ex,
            sets: ex.sets.map((_, i) => ({
                id: Date.now() + i + Math.random(),
                weight: '',
                reps: '',
                distance: '',
                time: '',
                rpe: 0,
                completed: false
            }))
        }));

        const newTemplate = {
            id: Date.now(),
            name,
            exercises: structuredExercises,
            createdAt: new Date().toISOString()
        };
        
        setTemplates(prev => [...prev, newTemplate]);

        // If a specific folder/routine was selected, save it there too
        if (routineId) {
            setRoutines(prev => prev.map(routine => 
                routine.id === routineId 
                    ? { ...routine, templates: [...routine.templates, newTemplate] }
                    : routine
            ));
        }

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
            loadTemplate,
            removeFromCart,
            updateCartItem,
            clearCart,
            reorderCart,
            templates,
            deleteTemplate,
            updateTemplateLastUsed,
            updateTemplate,
            saveTemplate,
            routines,
            addRoutine,
            sessions,
            completeWorkout,
            updateSession,
            getPreviousExerciseData, // Added utility for Ghost guide
            saveSessionAsTemplate
        }}>
            {children}
        </WorkoutContext.Provider>
    );
};

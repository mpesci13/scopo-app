import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

const ChallengeContext = createContext();

export const useChallenge = () => {
    const context = useContext(ChallengeContext);
    if (!context) {
        throw new Error('useChallenge must be used within a ChallengeProvider');
    }
    return context;
};

// Hardcoded current user for MVP
const CURRENT_USER = {
    id: 'user_123',
    name: 'Marco'
};

export const ChallengeProvider = ({ children }) => {
    const [challenges, setChallenges] = useState(() => {
        const saved = localStorage.getItem('scopo_challenges');
        if (saved) return JSON.parse(saved);

        // Default to empty array
        return [];
    });

    useEffect(() => {
        localStorage.setItem('scopo_challenges', JSON.stringify(challenges));
    }, [challenges]);

    // Derived states
    // Get all challenges the current user is a part of and that are currently active
    const activeChallenge = useMemo(() => {
        return challenges.find(c => {
            const isParticipant = c.participants.some(p => p.userId === CURRENT_USER.id);
            const isOngoing = new Date(c.duration.endDate) >= new Date() && c.status !== 'abandoned';
            return isParticipant && isOngoing;
        });
    }, [challenges]);

    // Get all past challenges (completed or abandoned)
    const pastChallenges = useMemo(() => {
        return challenges.filter(c => {
            const isParticipant = c.participants.some(p => p.userId === CURRENT_USER.id);
            const isPast = new Date(c.duration.endDate) < new Date() || c.status === 'abandoned';
            return isParticipant && isPast;
        }).sort((a, b) => new Date(b.duration.endDate) - new Date(a.duration.endDate));
    }, [challenges]);

    const createChallenge = (data) => {
        const newChallenge = {
            id: `chal_${Date.now()}`,
            title: data.title,
            description: data.description,
            goalType: data.goalType,
            duration: data.duration,
            participants: [
                {
                    userId: CURRENT_USER.id,
                    name: CURRENT_USER.name,
                    currentScore: 0,
                    streak: 0,
                    linkedWorkoutIds: []
                }
            ]
        };
        setChallenges(prev => [...prev, newChallenge]);
        return newChallenge;
    };

    const createCustomChallenge = (title, durationDays, rules) => {
        const startDate = new Date().toISOString();
        const endDate = new Date(Date.now() + durationDays * 86400000).toISOString();

        const newChallenge = {
            id: `chal_${Date.now()}`,
            title,
            description: `${durationDays}-Day Custom Challenge`,
            goalType: 'custom',
            duration: { startDate, endDate },
            rules,
            participants: [
                {
                    userId: CURRENT_USER.id,
                    name: CURRENT_USER.name,
                    currentScore: 0,
                    streak: 0,
                    linkedWorkoutIds: [],
                    dailyLogs: {},
                    progress: {}
                }
            ]
        };
        setChallenges(prev => [newChallenge, ...prev]);
        return newChallenge;
    };

    const toggleDailyRule = (challengeId, ruleId, dateString, isCompleted) => {
        setChallenges(prev => prev.map(c => {
            if (c.id !== challengeId) return c;
            return {
                ...c,
                participants: c.participants.map(p => {
                    if (p.userId === CURRENT_USER.id) {
                        const dailyLogs = p.dailyLogs ? { ...p.dailyLogs } : {};
                        if (!dailyLogs[dateString]) dailyLogs[dateString] = {};
                        dailyLogs[dateString] = {
                            ...dailyLogs[dateString],
                            [ruleId]: isCompleted
                        };
                        return { ...p, dailyLogs };
                    }
                    return p;
                })
            };
        }));
    };

    const joinChallenge = (challengeId) => {
        setChallenges(prev => prev.map(c => {
            if (c.id === challengeId) {
                // Ensure they aren't already in it
                if (!c.participants.some(p => p.userId === CURRENT_USER.id)) {
                    return {
                        ...c,
                        participants: [
                            ...c.participants,
                            {
                                userId: CURRENT_USER.id,
                                name: CURRENT_USER.name,
                                currentScore: 0,
                                streak: 0,
                                linkedWorkoutIds: []
                            }
                        ]
                    };
                }
            }
            return c;
        }));
    };

    const abandonChallenge = (challengeId, note = '') => {
        setChallenges(prev => prev.map(c => {
            if (c.id === challengeId) {
                return {
                    ...c,
                    status: 'abandoned',
                    reflection: note,
                    duration: {
                        ...c.duration,
                        endDate: new Date().toISOString() // Force it to end now
                    }
                };
            }
            return c;
        }));
    };

    const completeChallenge = (challengeId, note = '') => {
        setChallenges(prev => prev.map(c => {
            if (c.id === challengeId) {
                return {
                    ...c,
                    status: 'completed',
                    reflection: note,
                    duration: {
                        ...c.duration,
                        endDate: new Date().toISOString() // Set current time as completion
                    }
                };
            }
            return c;
        }));
    };

    const updateChallenge = (challengeId, data) => {
        setChallenges(prev => prev.map(c => {
            if (c.id !== challengeId) return c;
            
            // Recalculate end date based on original start date + new durationDays
            const startStr = c.duration.startDate;
            const newEndDate = new Date(new Date(startStr).getTime() + data.durationDays * 86400000).toISOString();

            return {
                ...c,
                title: data.title,
                rules: data.rules,
                duration: {
                    ...c.duration,
                    endDate: newEndDate
                }
            };
        }));
    };

    const linkWorkoutToChallenge = (workoutId, challengeId, workoutData, stats) => {
        setChallenges(prev => prev.map(c => {
            if (c.id !== challengeId) return c;

            // Calculate the score to add based on goalType
            let scoreToAdd = 0;
            if (c.goalType === 'volume' && stats?.volume) {
                scoreToAdd = stats.volume;
            } else if (c.goalType === 'reps' && stats?.reps) {
                scoreToAdd = stats.reps; // Assumes stats will eventually have reps if needed, or derived from data
            } else if (c.goalType === 'sessions') {
                scoreToAdd = 1;
            }

            if (scoreToAdd === 0 && c.goalType !== 'custom') return c;

            return {
                ...c,
                participants: c.participants.map(p => {
                    if (p.userId === CURRENT_USER.id) {
                        // Idempotency Check: Prevent duplicate scoring from the same workout
                        if (p.linkedWorkoutIds && p.linkedWorkoutIds.includes(workoutId)) {
                            console.warn(`Workout ${workoutId} already linked to challenge ${challengeId}`);
                            return p;
                        }

                        // Auto-check workout rules for custom challenges
                        let updatedDailyLogs = p.dailyLogs ? { ...p.dailyLogs } : {};
                        if (c.goalType === 'custom' && c.rules) {
                            const todayStr = new Date().toLocaleDateString('en-US');
                            c.rules.forEach(rule => {
                                if (rule.isWorkoutRule) {
                                    if (!updatedDailyLogs[todayStr]) {
                                        updatedDailyLogs[todayStr] = {};
                                    }
                                    updatedDailyLogs[todayStr][rule.id] = true;
                                }
                            });
                        }

                        return {
                            ...p,
                            currentScore: p.currentScore + scoreToAdd,
                            linkedWorkoutIds: [...(p.linkedWorkoutIds || []), workoutId],
                            dailyLogs: Object.keys(updatedDailyLogs).length > 0 ? updatedDailyLogs : p.dailyLogs
                        };
                    }
                    return p;
                })
            };
        }));
    };

    const unlinkWorkoutFromChallenge = (workoutId, challengeId, stats) => {
        setChallenges(prev => prev.map(c => {
            if (c.id !== challengeId) return c;

            let scoreToSubtract = 0;
            if (c.goalType === 'volume' && stats?.volume) {
                scoreToSubtract = stats.volume;
            } else if (c.goalType === 'reps' && stats?.reps) {
                scoreToSubtract = stats.reps;
            } else if (c.goalType === 'sessions') {
                scoreToSubtract = 1;
            }

            if (scoreToSubtract === 0 && c.goalType !== 'custom') return c;

            return {
                ...c,
                participants: c.participants.map(p => {
                    if (p.userId === CURRENT_USER.id) {
                        if (!p.linkedWorkoutIds || !p.linkedWorkoutIds.includes(workoutId)) {
                            return p;
                        }

                        return {
                            ...p,
                            currentScore: Math.max(0, p.currentScore - scoreToSubtract),
                            linkedWorkoutIds: p.linkedWorkoutIds.filter(id => id !== workoutId)
                        };
                    }
                    return p;
                })
            };
        }));
    };

    const updateChallengeWorkoutStats = (workoutId, oldStats, newStats) => {
        setChallenges(prev => prev.map(c => {
            let scoreDiff = 0;
            if (c.goalType === 'volume') {
                scoreDiff = (newStats?.volume || 0) - (oldStats?.volume || 0);
            } else if (c.goalType === 'reps') {
                scoreDiff = (newStats?.reps || 0) - (oldStats?.reps || 0);
            }

            if (scoreDiff === 0) return c;

            return {
                ...c,
                participants: c.participants.map(p => {
                    if (p.userId === CURRENT_USER.id && p.linkedWorkoutIds?.includes(workoutId)) {
                        return {
                            ...p,
                            currentScore: Math.max(0, p.currentScore + scoreDiff)
                        };
                    }
                    return p;
                })
            };
        }));
    };

    return (
        <ChallengeContext.Provider value={{
            challenges,
            activeChallenge,
            pastChallenges,
            createChallenge,
            createCustomChallenge,
            toggleDailyRule,
            joinChallenge,
            abandonChallenge,
            completeChallenge,
            updateChallenge,
            linkWorkoutToChallenge,
            unlinkWorkoutFromChallenge,
            updateChallengeWorkoutStats,
            currentUser: CURRENT_USER // Exposing for other components if needed
        }}>
            {children}
        </ChallengeContext.Provider>
    );
};

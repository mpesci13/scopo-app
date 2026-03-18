import React, { createContext, useContext, useEffect, useState } from 'react';

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

        // Default Seed Data
        return [
            {
                id: 'chal_spring_volume',
                title: 'Spring Lifting Festival',
                description: 'Hit 100k lbs before summer starts!',
                goalType: 'volume', // 'volume', 'reps', 'sessions'
                duration: {
                    startDate: new Date(Date.now() - 5 * 86400000).toISOString(),
                    endDate: new Date(Date.now() + 30 * 86400000).toISOString()
                },
                participants: [
                    {
                        userId: 'user_123',
                        name: 'Marco',
                        currentScore: 24500, // starting score
                        streak: 2,
                        linkedWorkoutIds: []
                    },
                    {
                        userId: 'user_456',
                        name: 'Alex',
                        currentScore: 18200,
                        streak: 1,
                        linkedWorkoutIds: []
                    }
                ]
            },
            {
                id: 'chal_consistency_march',
                title: 'March Madness',
                description: 'Record 15 sessions this month.',
                goalType: 'sessions', // counts completeWorkout
                duration: {
                    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
                    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()
                },
                participants: [
                    {
                        userId: 'user_123',
                        name: 'Marco',
                        currentScore: 5,
                        streak: 3,
                        linkedWorkoutIds: []
                    }
                ]
            }
        ];
    });

    useEffect(() => {
        localStorage.setItem('scopo_challenges', JSON.stringify(challenges));
    }, [challenges]);

    // Derived states
    // Get all challenges the current user is a part of and that are currently active
    const activeUserChallenges = challenges.filter(c => {
        const isParticipant = c.participants.some(p => p.userId === CURRENT_USER.id);
        const isOngoing = new Date(c.duration.endDate) >= new Date();
        return isParticipant && isOngoing;
    });

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

            if (scoreToAdd === 0) return c;

            return {
                ...c,
                participants: c.participants.map(p => {
                    if (p.userId === CURRENT_USER.id) {
                        // Idempotency Check: Prevent duplicate scoring from the same workout
                        if (p.linkedWorkoutIds && p.linkedWorkoutIds.includes(workoutId)) {
                            console.warn(`Workout ${workoutId} already linked to challenge ${challengeId}`);
                            return p;
                        }

                        return {
                            ...p,
                            currentScore: p.currentScore + scoreToAdd,
                            linkedWorkoutIds: [...(p.linkedWorkoutIds || []), workoutId]
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

            if (scoreToSubtract === 0) return c;

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
            activeUserChallenges,
            createChallenge,
            joinChallenge,
            linkWorkoutToChallenge,
            unlinkWorkoutFromChallenge,
            updateChallengeWorkoutStats,
            currentUser: CURRENT_USER // Exposing for other components if needed
        }}>
            {children}
        </ChallengeContext.Provider>
    );
};

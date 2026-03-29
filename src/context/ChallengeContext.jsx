import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { db } from '../firebase';
import { 
    collection, 
    onSnapshot, 
    query, 
    where, 
    addDoc, 
    updateDoc, 
    doc, 
    getDocs, 
    setDoc,
    serverTimestamp 
} from 'firebase/firestore';

const ChallengeContext = createContext();

export const useChallenge = () => {
    const context = useContext(ChallengeContext);
    if (!context) {
        throw new Error('useChallenge must be used within a ChallengeProvider');
    }
    return context;
};

export const ChallengeProvider = ({ children, user }) => {
    const [challenges, setChallenges] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(true);

    // 0. PROFILE FETCHING
    useEffect(() => {
        if (!user) {
            setProfile(null);
            setProfileLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
            if (snapshot.exists()) {
                setProfile(snapshot.data());
            } else {
                setProfile(null);
            }
            setProfileLoading(false);
        }, (error) => {
            console.error("Profile Fetch Error:", error);
            setProfileLoading(false); // Ensure app doesn't hang on spinner
        });

        return () => unsubscribe();
    }, [user]);

    const currentUser = useMemo(() => {
        if (!user) return null;
        return {
            id: user.uid,
            name: profile?.nickname || user.displayName || user.email?.split('@')[0] || 'Athlete',
            emoji: profile?.emoji || '🐺',
            email: user.email
        };
    }, [user, profile]);

    const saveProfile = async (data) => {
        setProfileLoading(true);
        try {
            await setDoc(doc(db, 'users', user.uid), {
                ...data,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        } catch (err) {
            console.error("Profile Save Error:", err);
            throw err;
        } finally {
            setProfileLoading(false);
        }
    };

    // 1. REAL-TIME FETCHING
    useEffect(() => {
        if (!currentUser) return;

        // Query: Challenges where the current user is a participant
        const q = query(
            collection(db, 'challenges'),
            where('participantIds', 'array-contains', currentUser.id)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setChallenges(fetched);
            setLoading(false);
        }, (error) => {
            console.error("Firestore Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // 2. MIGRATION BRIDGE: One-time sync from localStorage to Firebase
    useEffect(() => {
        const performMigration = async () => {
            if (!currentUser) return;
            
            const localData = localStorage.getItem('scopo_challenges');
            const hasMigrated = localStorage.getItem(`scopo_migrated_${currentUser.id}`);
            
            if (localData && !hasMigrated) {
                try {
                    const localChallenges = JSON.parse(localData);
                    console.log(`Starting migration of ${localChallenges.length} challenges...`);
                    
                    for (const chal of localChallenges) {
                        // Ensure ID is unique in cloud
                        const { id: oldId, ...cleanChal } = chal;
                        
                        // Ensure current user is in participants list correctly
                        const participants = cleanChal.participants.map(p => {
                            if (p.userId === 'user_123') { // Map old hardcoded ID to new Firebase UID
                                return { ...p, userId: currentUser.id, name: currentUser.name };
                            }
                            return p;
                        });

                        const participantIds = participants.map(p => p.userId);
                        if (!participantIds.includes(currentUser.id)) {
                            participantIds.push(currentUser.id);
                        }

                        await addDoc(collection(db, 'challenges'), {
                            ...cleanChal,
                            participants,
                            participantIds,
                            createdAt: serverTimestamp()
                        });
                    }
                    
                    localStorage.setItem(`scopo_migrated_${currentUser.id}`, 'true');
                    localStorage.removeItem('scopo_challenges'); // Cleanup local storage after success
                    console.log("Migration complete!");
                } catch (err) {
                    console.error("Migration failed:", err);
                }
            }
        };

        performMigration();
    }, [currentUser]);

    // Derived states
    const activeChallenge = useMemo(() => {
        return challenges.find(c => {
            const isParticipant = c.participants.some(p => p.userId === currentUser.id);
            const isOngoing = new Date(c.duration.endDate) >= new Date() && c.status !== 'abandoned';
            return isParticipant && isOngoing;
        });
    }, [challenges, currentUser]);

    const pastChallenges = useMemo(() => {
        return challenges.filter(c => {
            const isParticipant = c.participants.some(p => p.userId === currentUser.id);
            const isPast = new Date(c.duration.endDate) < new Date() || c.status === 'abandoned';
            return isParticipant && isPast;
        }).sort((a, b) => new Date(b.duration.endDate) - new Date(a.duration.endDate));
    }, [challenges, currentUser]);

    const createChallenge = async (data) => {
        const newChallenge = {
            title: data.title,
            description: data.description,
            goalType: data.goalType,
            duration: data.duration,
            participantIds: [currentUser.id],
            participants: [
                {
                    userId: currentUser.id,
                    name: currentUser.name,
                    currentScore: 0,
                    streak: 0,
                    linkedWorkoutIds: []
                }
            ],
            createdAt: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, 'challenges'), newChallenge);
        return { id: docRef.id, ...newChallenge };
    };

    const createCustomChallenge = async (title, durationDays, rules, squadData = {}) => {
        const startDate = new Date().toISOString();
        const endDate = new Date(Date.now() + durationDays * 86400000).toISOString();

        // Generate a simple join code for shared challenges
        const joinCode = squadData.isShared 
            ? Math.random().toString(36).substring(2, 8).toUpperCase() 
            : null;

        const newChallenge = {
            title,
            description: `${durationDays}-Day Custom Challenge`,
            goalType: 'custom',
            duration: { startDate, endDate },
            rules,
            isShared: squadData.isShared || false,
            squadName: squadData.squadName || '',
            joinCode,
            participantIds: [currentUser.id],
            participants: [
                {
                    userId: currentUser.id,
                    name: currentUser.name,
                    emoji: currentUser.emoji,
                    currentScore: 0,
                    streak: 0,
                    linkedWorkoutIds: [],
                    dailyLogs: {},
                    progress: {}
                }
            ],
            createdAt: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, 'challenges'), newChallenge);
        return { id: docRef.id, ...newChallenge };
    };

    const toggleDailyRule = async (challengeId, ruleId, dateString, isCompleted) => {
        const chal = challenges.find(c => c.id === challengeId);
        if (!chal) return;

        const updatedParticipants = chal.participants.map(p => {
            if (p.userId === currentUser.id) {
                const dailyLogs = p.dailyLogs ? { ...p.dailyLogs } : {};
                if (!dailyLogs[dateString]) dailyLogs[dateString] = {};
                dailyLogs[dateString] = {
                    ...dailyLogs[dateString],
                    [ruleId]: isCompleted
                };
                return { ...p, dailyLogs };
            }
            return p;
        });

        await updateDoc(doc(db, 'challenges', challengeId), {
            participants: updatedParticipants
        });
    };

    const joinChallenge = async (challengeId) => {
        const chal = challenges.find(c => c.id === challengeId);
        if (!chal) return;

        // Ensure they aren't already in it
        if (!chal.participants.some(p => p.userId === currentUser.id)) {
            const updatedParticipants = [
                ...chal.participants,
                {
                    userId: currentUser.id,
                    name: currentUser.name,
                    currentScore: 0,
                    streak: 0,
                    linkedWorkoutIds: []
                }
            ];
            
            const updatedParticipantIds = [
                ...(chal.participantIds || []),
                currentUser.id
            ];

            await updateDoc(doc(db, 'challenges', challengeId), {
                participants: updatedParticipants,
                participantIds: updatedParticipantIds
            });
        }
    };

    const abandonChallenge = async (challengeId, note = '') => {
        await updateDoc(doc(db, 'challenges', challengeId), {
            status: 'abandoned',
            reflection: note,
            'duration.endDate': new Date().toISOString()
        });
    };

    const completeChallenge = async (challengeId, note = '') => {
        await updateDoc(doc(db, 'challenges', challengeId), {
            status: 'completed',
            reflection: note,
            'duration.endDate': new Date().toISOString()
        });
    };

    const updateChallenge = async (challengeId, data) => {
        const chal = challenges.find(c => c.id === challengeId);
        if (!chal) return;

        const startStr = chal.duration.startDate;
        const newEndDate = new Date(new Date(startStr).getTime() + data.durationDays * 86400000).toISOString();

        await updateDoc(doc(db, 'challenges', challengeId), {
            title: data.title,
            rules: data.rules,
            'duration.endDate': newEndDate
        });
    };

    const linkWorkoutToChallenge = async (workoutId, challengeId, workoutData, stats) => {
        const chal = challenges.find(c => c.id === challengeId);
        if (!chal) return;

        // Calculate the score to add based on goalType
        let scoreToAdd = 0;
        if (chal.goalType === 'volume' && stats?.volume) {
            scoreToAdd = stats.volume;
        } else if (chal.goalType === 'reps' && stats?.reps) {
            scoreToAdd = stats.reps;
        } else if (chal.goalType === 'sessions') {
            scoreToAdd = 1;
        }

        if (scoreToAdd === 0 && chal.goalType !== 'custom') return;

        const updatedParticipants = chal.participants.map(p => {
            if (p.userId === currentUser.id) {
                // Idempotency Check: Prevent duplicate scoring
                if (p.linkedWorkoutIds && p.linkedWorkoutIds.includes(workoutId)) return p;

                let updatedDailyLogs = p.dailyLogs ? { ...p.dailyLogs } : {};
                if (chal.goalType === 'custom' && chal.rules) {
                    const todayStr = new Date().toLocaleDateString('en-US');
                    chal.rules.forEach(rule => {
                        if (rule.isWorkoutRule) {
                            if (!updatedDailyLogs[todayStr]) updatedDailyLogs[todayStr] = {};
                            updatedDailyLogs[todayStr][rule.id] = true;
                        }
                    });
                }

                return {
                    ...p,
                    currentScore: (p.currentScore || 0) + scoreToAdd,
                    linkedWorkoutIds: [...(p.linkedWorkoutIds || []), workoutId],
                    dailyLogs: updatedDailyLogs
                };
            }
            return p;
        });

        await updateDoc(doc(db, 'challenges', challengeId), {
            participants: updatedParticipants
        });
    };

    const unlinkWorkoutFromChallenge = async (workoutId, challengeId, stats) => {
        const chal = challenges.find(c => c.id === challengeId);
        if (!chal) return;

        let scoreToSubtract = 0;
        if (chal.goalType === 'volume' && stats?.volume) {
            scoreToSubtract = stats.volume;
        } else if (chal.goalType === 'reps' && stats?.reps) {
            scoreToSubtract = stats.reps;
        } else if (chal.goalType === 'sessions') {
            scoreToSubtract = 1;
        }

        const updatedParticipants = chal.participants.map(p => {
            if (p.userId === currentUser.id) {
                if (!p.linkedWorkoutIds || !p.linkedWorkoutIds.includes(workoutId)) return p;

                return {
                    ...p,
                    currentScore: Math.max(0, (p.currentScore || 0) - scoreToSubtract),
                    linkedWorkoutIds: p.linkedWorkoutIds.filter(id => id !== workoutId)
                };
            }
            return p;
        });

        await updateDoc(doc(db, 'challenges', challengeId), {
            participants: updatedParticipants
        });
    };

    const updateChallengeWorkoutStats = async (workoutId, oldStats, newStats) => {
        // This is complex for Firestore - we iterate active challenges that include this workout
        for (const c of challenges) {
            if (!c.participants.some(p => p.userId === currentUser.id && p.linkedWorkoutIds?.includes(workoutId))) continue;

            let scoreDiff = 0;
            if (c.goalType === 'volume') {
                scoreDiff = (newStats?.volume || 0) - (oldStats?.volume || 0);
            } else if (c.goalType === 'reps') {
                scoreDiff = (newStats?.reps || 0) - (oldStats?.reps || 0);
            }

            if (scoreDiff === 0) continue;

            const updatedParticipants = c.participants.map(p => {
                if (p.userId === currentUser.id && p.linkedWorkoutIds?.includes(workoutId)) {
                    return {
                        ...p,
                        currentScore: Math.max(0, (p.currentScore || 0) + scoreDiff)
                    };
                }
                return p;
            });

            await updateDoc(doc(db, 'challenges', c.id), {
                participants: updatedParticipants
            });
        }
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
            currentUser,
            profile,
            profileLoading,
            saveProfile
        }}>
            {children}
        </ChallengeContext.Provider>
    );
};

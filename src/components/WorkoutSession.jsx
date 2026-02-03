import { ChevronLeft, X, Clock, AlertTriangle } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { useEffect, useState } from 'react';
import { MOCK_EXERCISES } from '../data/exercises';


// ... (inside component)



export default function WorkoutSession({ onBack, onFinish }) {
    const {
        cart, session, startSession, addSet, updateSet, completeSet, completeAllSets, endSession,
        updateExerciseSettings
    } = useWorkout();

    const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);

    // Init session if needed
    useEffect(() => {
        if (!session && cart.size > 0) {
            startSession(Array.from(cart));
        }
    }, [cart, session, startSession]);

    if (!session) return null;

    const selectedExercises = MOCK_EXERCISES.filter(ex => session.exercises.hasOwnProperty(ex.id));

    // Calculate total sets for guardrail
    const totalSets = Object.values(session.exercises).reduce((acc, sets) => acc + sets.length, 0);

    const handleFinish = () => {
        setIsFinishModalOpen(true);
    };

    const confirmFinish = (completeAll = false) => {
        if (completeAll) {
            completeAllSets();
        }
        // Small timeout to allow state update to propagate? 
        // Actually endSession reads 'session' from state. 
        // React state updates are batched. 
        // endSession() inside the same event loop might see old state.
        // We should pass a flag to endSession or let endSession handle it?
        // Or simpler: just setTimeout.
        setTimeout(() => {
            const finalData = endSession();
            onFinish?.(finalData);
        }, 50);
    };

    const handleCancel = () => {
        if (confirm('Cancel workout? This will discard your progress.')) {
            endSession(); // Discard
            onBack(); // Go home
        }
    };

    return (
        <div className="container">
            <header style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <button
                        onClick={onBack} // Or Cancel? usually Back just minimizes. Cancel destroys.
                        style={{
                            padding: 'var(--space-sm)',
                            marginLeft: '-0.5rem',
                            color: 'hsl(var(--color-primary))'
                        }}
                    >
                        <ChevronLeft />
                    </button>
                    <div>
                        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', lineHeight: '1.1' }}>
                            Active Workout
                        </h1>
                        <RunningClock startTime={session.startTime} />
                    </div>
                </div>



                {/* TIMER TOGGLE REMOVED - PER EXERCISE SETTINGS NOW */}
            </header >

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {selectedExercises.map(ex => {
                    const sets = session.exercises[ex.id] || [];
                    return (
                        <div
                            key={ex.id}
                            style={{
                                padding: 'var(--space-md)',
                                backgroundColor: 'hsl(var(--color-surface))',
                                borderRadius: 'var(--radius-lg)',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                                <h3 style={{ fontWeight: 'var(--font-weight-medium)' }}>{ex.name}</h3>

                                {/* TIMER CONTROLS */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => updateExerciseSettings(ex.id, { timerEnabled: !session.exerciseSettings?.[ex.id]?.timerEnabled })}
                                        style={{
                                            fontSize: '0.75rem',
                                            padding: '0.3rem 0.6rem',
                                            borderRadius: 'var(--radius-md)',
                                            backgroundColor: session.exerciseSettings?.[ex.id]?.timerEnabled ? 'hsl(var(--color-primary))' : 'hsl(var(--color-bg))',
                                            color: session.exerciseSettings?.[ex.id]?.timerEnabled ? 'white' : 'hsl(var(--color-text-muted))',
                                            border: '1px solid transparent',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Timer
                                    </button>

                                    {session.exerciseSettings?.[ex.id]?.timerEnabled && (
                                        <select
                                            value={session.exerciseSettings?.[ex.id]?.timerDuration || 60}
                                            onChange={(e) => updateExerciseSettings(ex.id, { timerDuration: Number(e.target.value) })}
                                            style={{
                                                fontSize: '0.75rem',
                                                padding: '0.3rem',
                                                borderRadius: 'var(--radius-md)',
                                                backgroundColor: 'hsl(var(--color-bg))',
                                                color: 'hsl(var(--color-text))',
                                                border: 'none',
                                                fontWeight: '500'
                                            }}
                                        >
                                            <option value={30}>30s</option>
                                            <option value={45}>45s</option>
                                            <option value={60}>60s</option>
                                            <option value={90}>90s</option>
                                            <option value={120}>2m</option>
                                            <option value={180}>3m</option>
                                        </select>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {sets.map((set, index) => (
                                    <SetRow
                                        key={set.id}
                                        set={set}
                                        index={index}
                                        exerciseType={(ex.type || 'strength').toLowerCase()}
                                        allowToggle={ex.allowToggle}
                                        onUpdate={(field, val) => updateSet(ex.id, index, field, val)}
                                        onComplete={() => completeSet(ex.id, index)}
                                    />
                                ))}
                            </div>

                            {/* ADD SET BUTTON */}
                            <button
                                onClick={() => addSet(ex.id)}
                                style={{
                                    width: '100%',
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    backgroundColor: 'hsl(var(--color-bg))',
                                    color: 'hsl(var(--color-primary))',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                + Add Set
                            </button>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={handleCancel}
                style={{
                    marginTop: 'var(--space-xl)',
                    marginBottom: '1rem',
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: 'transparent',
                    color: 'hsl(var(--color-destruct))',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 'bold',
                    border: '1px solid hsl(var(--color-destruct))'
                }}>
                Cancel Workout
            </button>

            <button
                disabled={totalSets === 0}
                onClick={handleFinish}
                style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: 'hsl(var(--color-destruct))',
                    color: 'white',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 'bold',
                    opacity: totalSets === 0 ? 0.5 : 1
                }}>
                Finish Workout
            </button>

            {/* FINISH ACTIONSHEET/MODAL */}
            {isFinishModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    zIndex: 2000
                }} onClick={() => setIsFinishModalOpen(false)}>
                    <div style={{
                        width: '100%',
                        backgroundColor: 'hsl(var(--color-surface))',
                        borderTopLeftRadius: 'var(--radius-xl)',
                        borderTopRightRadius: 'var(--radius-xl)',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        animation: 'slideUp 0.3s ease-out'
                    }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Finish Workout?</h3>

                        <button
                            onClick={() => confirmFinish(true)}
                            style={{ padding: '1rem', backgroundColor: 'hsl(var(--color-primary))', color: 'white', borderRadius: 'var(--radius-lg)', fontWeight: 'bold' }}
                        >
                            Complete Unfinished Sets & Finish
                        </button>

                        <button
                            onClick={() => confirmFinish(false)}
                            style={{ padding: '1rem', backgroundColor: 'hsl(var(--color-bg))', color: 'hsl(var(--color-text))', borderRadius: 'var(--radius-lg)', fontWeight: 'bold' }}
                        >
                            Finish (Leave Unfinished)
                        </button>

                        <button
                            onClick={handleCancel}
                            style={{ padding: '1rem', backgroundColor: 'rgba(255, 59, 48, 0.1)', color: 'hsl(var(--color-destruct))', borderRadius: 'var(--radius-lg)', fontWeight: 'bold' }}
                        >
                            Delete Workout
                        </button>

                        <button
                            onClick={() => setIsFinishModalOpen(false)}
                            style={{ padding: '1rem', marginTop: '0.5rem', backgroundColor: 'transparent', color: 'hsl(var(--color-text-muted))', fontWeight: 'bold' }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
            `}</style>
        </div >
    );
}

function RunningClock({ startTime }) {
    const [elapsed, setElapsed] = useState('00:00');

    useEffect(() => {
        const update = () => {
            const now = Date.now();
            const diff = Math.floor((now - startTime) / 1000);
            const m = Math.floor(diff / 60).toString().padStart(2, '0');
            const s = (diff % 60).toString().padStart(2, '0');
            setElapsed(`${m}:${s}`);
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [startTime]);

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'hsl(var(--color-text-muted))', fontSize: '0.9rem' }}>
            <Clock size={14} />
            <span>{elapsed}</span>
        </div>
    );
}

// ... Inside SetRow component ...
function SetRow({ set, index, exerciseType, allowToggle, onUpdate, onComplete }) {
    const isCompleted = set.completed;
    const currentVariant = set.variant || 'bodyweight'; // Default to bodyweight for toggleable exercises

    // Common Input Styles
    const inputStyle = {
        width: '100%',
        backgroundColor: 'hsl(var(--color-bg))',
        padding: '0.5rem',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center',
        border: '1px solid transparent',
        fontSize: '1rem',
        height: '40px',
        fontWeight: '500',
        color: 'inherit'
    };

    const handleFocus = (e) => e.target.style.borderColor = 'hsl(var(--color-primary))';
    const handleBlur = (e) => e.target.style.borderColor = 'transparent';

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            opacity: isCompleted ? 0.6 : 1,
            transition: 'opacity 0.2s',
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--color-border)'
        }}>
            {/* TOGGLE UI (Only if allowToggle is true) */}
            {allowToggle && (
                <div style={{ display: 'flex', marginBottom: '0.5rem', backgroundColor: 'hsl(var(--color-bg))', padding: '4px', borderRadius: 'var(--radius-md)' }}>
                    {['bodyweight', 'weighted', 'assisted'].map(variant => {
                        const isActive = currentVariant === variant;
                        return (
                            <button
                                key={variant}
                                onClick={() => onUpdate('variant', variant)}
                                style={{
                                    flex: 1,
                                    padding: '0.4rem',
                                    fontSize: '0.8rem',
                                    borderRadius: 'var(--radius-sm)',
                                    fontWeight: isActive ? '600' : '400',
                                    backgroundColor: isActive ? 'hsl(var(--color-surface))' : 'transparent',
                                    color: isActive ? 'hsl(var(--color-primary))' : 'hsl(var(--color-text-muted))',
                                    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {variant}
                            </button>
                        );
                    })}
                </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{
                    width: '24px',
                    fontSize: '0.75rem',
                    color: 'hsl(var(--color-text-muted))',
                    textAlign: 'center',
                    flexShrink: 0
                }}>
                    {index + 1}
                </div>

                {/* STRENGTH SCHEMA: Weight x Reps x RPE */}
                {exerciseType === 'strength' && (
                    <>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <input
                                type="number"
                                value={set.weight || ''}
                                onChange={(e) => onUpdate('weight', e.target.value)}
                                style={{
                                    ...inputStyle,
                                    opacity: (allowToggle && currentVariant === 'bodyweight') ? 0.3 : 1,
                                    pointerEvents: (allowToggle && currentVariant === 'bodyweight') ? 'none' : 'auto'
                                }}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                inputMode="decimal"
                            />
                            {!set.weight && (
                                <span className="ghost-label">
                                    LBS
                                </span>
                            )}
                        </div>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <input
                                type="number"
                                value={set.reps || ''}
                                onChange={(e) => onUpdate('reps', e.target.value)}
                                style={inputStyle}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                inputMode="numeric"
                            />
                            {!set.reps && <span className="ghost-label">REPS</span>}
                        </div>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <input
                                type="number"
                                value={set.rpe || ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    onUpdate('rpe', val);
                                }}
                                style={inputStyle}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                inputMode="numeric"
                            />
                            {!set.rpe && <span className="ghost-label">RPE</span>}
                        </div>
                    </>
                )}

                {/* CARDIO SCHEMA: Time x Distance x RPE */}
                {exerciseType === 'cardio' && (
                    <>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <input
                                type="text"
                                value={set.time || ''}
                                onChange={(e) => onUpdate('time', e.target.value)}
                                style={inputStyle}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                            />
                            {!set.time && <span className="ghost-label">TIME</span>}
                        </div>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <input
                                type="number"
                                value={set.distance || ''}
                                onChange={(e) => onUpdate('distance', e.target.value)}
                                style={inputStyle}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                inputMode="decimal"
                            />
                            {!set.distance && <span className="ghost-label">DIST</span>}
                        </div>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <input
                                type="number"
                                value={set.rpe || ''}
                                onChange={(e) => onUpdate('rpe', e.target.value)}
                                style={inputStyle}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                inputMode="numeric"
                            />
                            {!set.rpe && <span className="ghost-label">RPE</span>}
                        </div>
                    </>
                )}

                {/* CORE SCHEMA: Time OR Reps x RPE */}
                {exerciseType === 'core' && (
                    <>
                        <div style={{ flex: 2, position: 'relative' }}>
                            <input
                                type="text"
                                value={set.reps || set.time || ''}
                                onChange={(e) => {
                                    onUpdate('reps', e.target.value)
                                }}
                                style={inputStyle}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                            />
                            {(!set.reps && !set.time) && <span className="ghost-label">REPS</span>}
                        </div>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <input
                                type="number"
                                value={set.rpe || ''}
                                onChange={(e) => onUpdate('rpe', e.target.value)}
                                style={inputStyle}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                inputMode="numeric"
                            />
                            {!set.rpe && <span className="ghost-label">RPE</span>}
                        </div>
                    </>
                )}

                <button
                    onClick={onComplete}
                    style={{
                        backgroundColor: isCompleted ? 'hsl(142 71% 45%)' : 'hsl(var(--color-surface-hover))',
                        color: isCompleted ? 'white' : 'inherit',
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        flexShrink: 0
                    }}>
                    <span style={{ fontSize: '1.2rem' }}>✓</span>
                </button>
            </div>
        </div>
    );
}

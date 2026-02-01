import { ChevronLeft } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { useEffect } from 'react';
import { MOCK_EXERCISES } from '../data/exercises';
import RPESlider from './RPESlider';

export default function WorkoutSession({ onBack, onFinish }) {
    const { cart, session, startSession, updateSet, completeSet, endSession } = useWorkout();

    // Init session if needed
    useEffect(() => {
        if (!session && cart.size > 0) {
            startSession(Array.from(cart));
        }
    }, [cart, session, startSession]);

    if (!session) return null;

    const selectedExercises = MOCK_EXERCISES.filter(ex => session.exercises.hasOwnProperty(ex.id));

    const handleFinish = () => {
        const finalData = endSession();
        onFinish?.(finalData);
    };

    return (
        <div className="container">
            <header style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <button
                    onClick={onBack}
                    style={{
                        padding: 'var(--space-sm)',
                        marginLeft: '-0.5rem',
                        color: 'hsl(var(--color-primary))'
                    }}
                >
                    <ChevronLeft />
                </button>
                <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)' }}>
                    Active Workout
                </h1>
            </header>

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
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                                <h3 style={{ fontWeight: 'var(--font-weight-medium)' }}>{ex.name}</h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {sets.map((set, index) => (
                                    <SetRow
                                        key={set.id}
                                        set={set}
                                        index={index}
                                        exerciseType={ex.type || 'strength'}
                                        onUpdate={(field, val) => updateSet(ex.id, index, field, val)}
                                        onComplete={() => completeSet(ex.id, index)}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={handleFinish}
                style={{
                    marginTop: 'var(--space-xl)',
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: 'hsl(var(--color-destruct))',
                    color: 'white',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 'bold'
                }}>
                Finish Workout
            </button>
        </div>
    );
}

function SetRow({ set, index, exerciseType, onUpdate, onComplete }) {
    // Ghost value logic (mocked randomly for now)
    const ghostWeight = 135;
    const ghostReps = 10;
    const ghostTime = '10:00';
    const ghostDist = 1.5;

    const isCompleted = set.completed;

    // Common Input Styles
    const inputStyle = {
        width: '100%',
        backgroundColor: 'hsl(var(--color-bg))',
        padding: '0.75rem',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center',
        border: '1px solid transparent',
        fontSize: '1.1rem', // Larger for touch
        height: '50px', // Thumb friendly
        fontWeight: '500'
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

                {/* STRENGTH SCHEMA: Weight x Reps */
                    exerciseType === 'strength' && (
                        <>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <input
                                    type="number"
                                    value={set.weight || ''}
                                    onChange={(e) => onUpdate('weight', e.target.value)}
                                    placeholder={ghostWeight}
                                    style={inputStyle}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                    inputMode="decimal"
                                />
                                {!set.weight && <span className="ghost-label">lbs</span>}
                            </div>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <input
                                    type="number"
                                    value={set.reps || ''}
                                    onChange={(e) => onUpdate('reps', e.target.value)}
                                    placeholder={ghostReps}
                                    style={inputStyle}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                    inputMode="numeric"
                                />
                                {!set.reps && <span className="ghost-label">reps</span>}
                            </div>
                        </>
                    )}

                {/* CARDIO SCHEMA: Time x Distance */
                    exerciseType === 'cardio' && (
                        <>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <input
                                    type="text"
                                    value={set.time || ''}
                                    onChange={(e) => onUpdate('time', e.target.value)}
                                    placeholder={ghostTime}
                                    style={inputStyle}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                />
                                {!set.time && <span className="ghost-label">min</span>}
                            </div>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <input
                                    type="number"
                                    value={set.distance || ''}
                                    onChange={(e) => onUpdate('distance', e.target.value)}
                                    placeholder={ghostDist}
                                    style={inputStyle}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                    inputMode="decimal"
                                />
                                {!set.distance && <span className="ghost-label">mi</span>}
                            </div>
                        </>
                    )}

                {/* CORE SCHEMA: Time OR Reps */
                    exerciseType === 'core' && (
                        <div style={{ flex: 2, position: 'relative' }}>
                            <input
                                type="text"
                                value={set.reps || set.time || ''}
                                onChange={(e) => {
                                    onUpdate('reps', e.target.value)
                                }}
                                placeholder="Reps or Time"
                                style={inputStyle}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                            />
                        </div>
                    )}

                <button
                    onClick={onComplete}
                    style={{
                        backgroundColor: isCompleted ? 'hsl(142 71% 45%)' : 'hsl(var(--color-surface-hover))',
                        color: isCompleted ? 'white' : 'inherit',
                        width: '50px',
                        height: '50px',
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

            {/* RPE SLIDER ROW */}
            <div style={{ paddingLeft: '2rem' /* align with inputs, skipping index */ }}>
                <div style={{ marginBottom: '0.25rem', fontSize: '0.75rem', color: 'hsl(var(--color-text-muted))', fontWeight: '500' }}>
                    RPE (Exertion)
                </div>
                <RPESlider
                    value={set.rpe}
                    onChange={(val) => onUpdate('rpe', val)}
                />
            </div>

            {/* Ghost Label Styles (injected via style tag for scope simplicity or inline) */}
            <style>{`
                .ghost-label {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                    color: hsl(var(--color-text-muted));
                    opacity: 0.4;
                    font-size: 0.8rem;
                }
            `}</style>
        </div>
    );
}

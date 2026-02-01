import { ChevronLeft } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { useEffect } from 'react';
import { MOCK_EXERCISES } from '../data/exercises';

export default function WorkoutSession({ onBack, onFinish }) {
    const { cart, session, startSession, updateSet, completeSet, endSession } = useWorkout();

    // Init session if needed
    useEffect(() => {
        if (!session && cart.size > 0) {
            startSession(Array.from(cart));
        }
    }, [cart, session, startSession]);

    if (!session) return null;

    const selectedExercises = MOCK_EXERCISES.filter(ex => cart.has(ex.id));

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

function SetRow({ set, index, onUpdate, onComplete }) {
    // Ghost value logic (mocked randomly for now)
    // In real app, fetch last workout stats
    const ghostWeight = 135;
    const ghostReps = 10;

    const isCompleted = set.completed;

    return (
        <div style={{
            display: 'flex',
            gap: 'var(--space-sm)',
            alignItems: 'center',
            opacity: isCompleted ? 0.5 : 1,
            transition: 'opacity 0.2s'
        }}>
            <div style={{
                width: '24px',
                fontSize: '0.75rem',
                color: 'hsl(var(--color-text-muted))',
                textAlign: 'center'
            }}>
                {index + 1}
            </div>

            <div style={{ flex: 1, position: 'relative' }}>
                <input
                    type="number"
                    value={set.weight}
                    onChange={(e) => onUpdate('weight', e.target.value)}
                    placeholder={!set.weight ? `${ghostWeight}` : ''}
                    style={{
                        width: '100%',
                        backgroundColor: 'hsl(var(--color-bg))',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center',
                        border: '1px solid transparent',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'hsl(var(--color-primary))'}
                    onBlur={(e) => e.target.style.borderColor = 'transparent'}
                />
                {!set.weight && (
                    <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        color: 'hsl(var(--color-text-muted))',
                        opacity: 0.4,
                        fontSize: '0.875rem'
                    }}>
                        lbs
                    </span>
                )}
            </div>

            <div style={{ flex: 1, position: 'relative' }}>
                <input
                    type="number"
                    value={set.reps}
                    onChange={(e) => onUpdate('reps', e.target.value)}
                    placeholder={!set.reps ? `${ghostReps}` : ''}
                    style={{
                        width: '100%',
                        backgroundColor: 'hsl(var(--color-bg))',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center',
                        border: '1px solid transparent',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'hsl(var(--color-primary))'}
                    onBlur={(e) => e.target.style.borderColor = 'transparent'}
                />
                {!set.reps && (
                    <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        color: 'hsl(var(--color-text-muted))',
                        opacity: 0.4,
                        fontSize: '0.875rem'
                    }}>
                        reps
                    </span>
                )}
            </div>

            <button
                onClick={onComplete}
                style={{
                    backgroundColor: isCompleted ? 'hsl(142 71% 45%)' : 'hsl(var(--color-surface-hover))', // Green if done
                    color: isCompleted ? 'white' : 'inherit',
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    flexShrink: 0
                }}>
                ✓
            </button>
        </div>
    );
}

import { ChevronLeft, Save, X } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { useEffect, useState } from 'react';
import { MOCK_EXERCISES } from '../data/exercises';


// ... (inside component)



export default function WorkoutSession({ onBack, onFinish }) {
    const {
        cart, session, startSession, addSet, updateSet, completeSet, endSession,
        updateExerciseSettings, saveTemplate
    } = useWorkout();

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [templateName, setTemplateName] = useState('');

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
            <header style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
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

            {/* SAVE TEMPLATE BUTTON & MODAL */}
            <button
                onClick={() => setIsSaveModalOpen(true)}
                style={{
                    marginTop: 'var(--space-xl)',
                    marginBottom: '1rem',
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: 'transparent',
                    color: 'hsl(var(--color-primary))',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 'bold',
                    border: '2px solid hsl(var(--color-primary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                }}>
                <Save size={20} />
                Save as Template
            </button>

            {isSaveModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '2rem'
                }}>
                    <div style={{
                        backgroundColor: 'hsl(var(--color-surface))',
                        padding: '2rem',
                        borderRadius: 'var(--radius-lg)',
                        width: '100%',
                        maxWidth: '400px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Save Template</h2>
                            <button onClick={() => setIsSaveModalOpen(false)}>
                                <X />
                            </button>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Template Name</label>
                            <input
                                autoFocus
                                type="text"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                placeholder="e.g., Pull Day"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)',
                                    backgroundColor: 'hsl(var(--color-bg))',
                                    color: 'hsl(var(--color-text))',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <button
                            disabled={!templateName.trim()}
                            onClick={() => {
                                saveTemplate(templateName, Object.keys(session.exercises));
                                setIsSaveModalOpen(false);
                                setTemplateName('');
                                alert('Template Saved!');
                            }}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                backgroundColor: 'hsl(var(--color-primary))',
                                color: 'white',
                                borderRadius: 'var(--radius-full)',
                                fontWeight: 'bold',
                                opacity: templateName.trim() ? 1 : 0.5
                            }}
                        >
                            Save Template
                        </button>
                    </div>
                </div>
            )}

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
        </div >
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

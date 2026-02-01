import { X, Trash2, Play } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { MOCK_EXERCISES } from '../data/exercises';

export default function CartDrawer({ isOpen, onClose, onStart }) {
    const { cart, toggleExercise } = useWorkout();

    if (!isOpen) return null;

    const selectedExercises = MOCK_EXERCISES.filter(ex => cart.has(ex.id));

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 150,
                    animation: 'fadeIn 0.2s ease-out'
                }}
            />

            {/* Drawer */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'hsl(var(--color-surface))',
                borderTopLeftRadius: 'var(--space-xl)',
                borderTopRightRadius: 'var(--space-xl)',
                padding: 'var(--space-lg)',
                paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
                zIndex: 200,
                boxShadow: '0 -4px 24px rgba(0,0,0,0.1)',
                animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                    <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold' }}>
                        Current Workout ({cart.size})
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            padding: 'var(--space-xs)',
                            color: 'hsl(var(--color-text-muted))',
                            backgroundColor: 'hsl(var(--color-bg))',
                            borderRadius: '50%'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ overflowY: 'auto', flex: 1, marginBottom: 'var(--space-md)' }}>
                    {selectedExercises.length === 0 ? (
                        <p style={{ color: 'hsl(var(--color-text-muted))', textAlign: 'center', padding: '2rem 0' }}>
                            No exercises selected.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                            {selectedExercises.map(ex => (
                                <div
                                    key={ex.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.75rem 1rem',
                                        backgroundColor: 'hsl(var(--color-bg))',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid hsl(var(--color-border))'
                                    }}
                                >
                                    <span style={{ fontWeight: '500' }}>{ex.name}</span>
                                    <button
                                        onClick={() => toggleExercise(ex.id)}
                                        style={{
                                            color: 'hsl(var(--color-destruct))',
                                            padding: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cart.size > 0 && (
                    <button
                        onClick={() => {
                            onClose();
                            onStart();
                        }}
                        style={{
                            width: '100%',
                            backgroundColor: 'hsl(var(--color-primary))',
                            color: 'white',
                            padding: '1rem',
                            borderRadius: 'var(--radius-lg)',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            marginTop: 'auto'
                        }}
                    >
                        Start Workout <Play size={18} fill="currentColor" />
                    </button>
                )}
            </div>

            <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
        </>
    );
}

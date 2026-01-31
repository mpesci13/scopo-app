import { ChevronLeft } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

// Helper to lookup mock data (in real app, this would be from DB/store)
const MOCK_EXERCISES = [
    { id: 1, name: 'Bench Press', category: 'Chest' },
    { id: 2, name: 'Squat', category: 'Legs' },
    { id: 3, name: 'Deadlift', category: 'Back' },
    { id: 4, name: 'Overhead Press', category: 'Shoulders' },
    { id: 5, name: 'Pull Up', category: 'Back' },
    { id: 6, name: 'Dumbbell Curl', category: 'Arms' },
    { id: 7, name: 'Tricep Extension', category: 'Arms' },
    { id: 8, name: 'Leg Press', category: 'Legs' },
];

export default function WorkoutSession({ onBack }) {
    const { cart } = useWorkout();

    const selectedExercises = MOCK_EXERCISES.filter(ex => cart.has(ex.id));

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
                {selectedExercises.map(ex => (
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
                            <span style={{ color: 'hsl(var(--color-text-muted))', fontSize: 'var(--font-size-sm)' }}>
                                Set 1
                            </span>
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                            <input
                                type="number"
                                placeholder="kg"
                                style={{
                                    flex: 1,
                                    backgroundColor: 'hsl(var(--color-bg))',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    textAlign: 'center'
                                }}
                            />
                            <input
                                type="number"
                                placeholder="reps"
                                style={{
                                    flex: 1,
                                    backgroundColor: 'hsl(var(--color-bg))',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    textAlign: 'center'
                                }}
                            />
                            <button style={{
                                backgroundColor: 'hsl(var(--color-surface-hover))',
                                width: '40px',
                                borderRadius: 'var(--radius-md)'
                            }}>
                                ✓
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button style={{
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

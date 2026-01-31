import { Plus, Check } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

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

export default function ExerciseList({ filter, category }) {
    const { cart, toggleExercise } = useWorkout();

    const filtered = MOCK_EXERCISES.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes((filter || '').toLowerCase());
        const matchesCategory = category === 'All' || !category || ex.category === category;
        return matchesSearch && matchesCategory;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {filtered.map((ex) => {
                const isAdded = cart.has(ex.id);
                return (
                    <div
                        key={ex.id}
                        onClick={() => toggleExercise(ex.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem',
                            backgroundColor: 'hsl(var(--color-surface))',
                            borderRadius: 'var(--radius-lg)',
                            transition: 'background-color 0.2s',
                            cursor: 'pointer',
                            userSelect: 'none',
                            border: isAdded ? '1px solid hsl(var(--color-primary))' : '1px solid transparent',
                        }}
                    >
                        <div>
                            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                {ex.name}
                            </h3>
                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'hsl(var(--color-text-muted))' }}>
                                {ex.category}
                            </span>
                        </div>

                        <button
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: 'var(--radius-full)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: isAdded ? 'hsl(var(--color-primary))' : 'hsl(var(--color-surface-hover))',
                                color: isAdded ? 'white' : 'hsl(var(--color-primary))',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: isAdded ? 'scale(1.1)' : 'scale(1)',
                            }}
                        >
                            {isAdded ? <Check size={18} /> : <Plus size={18} />}
                        </button>
                    </div>
                );
            })}

            {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--color-text-muted))' }}>
                    No exercises found.
                </div>
            )}
        </div>
    );
}

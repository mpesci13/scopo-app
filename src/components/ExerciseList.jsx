import { useMemo } from 'react';
import { Plus, Check } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { MOCK_EXERCISES } from '../data/exercises';

export default function ExerciseList({ filter, category }) {
    const { cart, toggleExercise, exerciseFrequency } = useWorkout();

    const quickAddList = useMemo(() => {
        if (filter || (category && category !== 'All')) return [];
        return Object.entries(exerciseFrequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([id]) => MOCK_EXERCISES.find(ex => ex.id === id))
            .filter(Boolean);
    }, [exerciseFrequency, filter, category]);

    const filtered = useMemo(() => {
        return MOCK_EXERCISES
            .filter(ex => {
                const matchesSearch = ex.name.toLowerCase().includes((filter || '').toLowerCase());
                const matchesCategory = category === 'All' || !category || ex.bodyPart === category;
                return matchesSearch && matchesCategory;
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [filter, category]);

    const renderRow = (ex) => {
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
                        {ex.bodyPart}
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
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {quickAddList.length > 0 && (
                <>
                    <h2 style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: '600',
                        color: 'hsl(var(--color-text-muted))',
                        marginTop: '0.5rem',
                        marginBottom: '0.25rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Quick Add
                    </h2>
                    {quickAddList.map(renderRow)}
                    <h2 style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: '600',
                        color: 'hsl(var(--color-text-muted))',
                        marginTop: '1rem',
                        marginBottom: '0.25rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        All Exercises
                    </h2>
                </>
            )}

            {filtered.map(renderRow)}

            {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--color-text-muted))' }}>
                    {filter && category !== 'All' ? (
                        <>
                            No {category} exercises found for "{filter}". <br />
                            Check another category?
                        </>
                    ) : (
                        filter ? `No exercises found for "${filter}".` : 'No exercises found.'
                    )}
                </div>
            )}
        </div>
    );
}

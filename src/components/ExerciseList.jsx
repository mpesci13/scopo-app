import { useMemo } from 'react';
import { Plus, Check, Dumbbell } from 'lucide-react';
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

    // Simple Levenshtein distance for fuzzy search
    const levenshtein = (a, b) => {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    };

    const filtered = useMemo(() => {
        const search = (filter || '').toLowerCase().trim();

        return MOCK_EXERCISES
            .filter(ex => {
                const matchesCategory = category === 'All' || !category || ex.bodyPart === category;
                if (!matchesCategory) return false;

                if (!search) return true;

                const name = ex.name.toLowerCase();
                if (name.includes(search)) return true;

                // Fuzzy match: allow up to 2 typos for inputs > 3 chars
                if (search.length > 2) {
                    const dist = levenshtein(search, name);
                    // Allow error of 2, or 3 if search is long
                    const threshold = search.length > 5 ? 3 : 2;
                    // Also check if the 'name' contains a fuzzy version of 'search'? 
                    // This simple check compares the whole name vs search which might fail for partials.
                    // Better: check if 'search' fuzzy matches any *word* in 'name'?
                    // or just raw distance.
                    // Let's stick to raw distance on the full string for now as simple "Dumbell" vs "Dumbbell" works.
                    // But "Press" vs "Chest Press" - distance is large.
                    // Hybrid: Check if 'search' is close to any substring? Too complex for 1 pass.
                    // Let's just rely on: 
                    // 1. Exact substring (includes)
                    // 2. Levenshtein of the whole string vs search (only good if search is close to full name)
                    // 3. (Improvement) Levenshtein of discrete words in name?

                    const words = name.split(' ');
                    const wordMatch = words.some(w => levenshtein(search, w) <= 2);
                    if (wordMatch) return true;

                    return dist <= threshold;
                }

                return false;
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [filter, category]);

    const renderRow = (ex) => {
        const isAdded = cart.has(ex.id);

        // const color = BODY_PART_COLORS[ex.bodyPart] || 'hsl(var(--color-primary))';

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
                    transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    border: isAdded ? '1.5px solid hsl(var(--color-primary))' : '1.5px solid transparent',
                    boxShadow: isAdded ? '0 0 12px var(--color-primary-glow)' : '0 2px 4px rgba(0,0,0,0.05)',
                    transform: isAdded ? 'scale(1.01)' : 'scale(1)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Subtle Gradient Overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(120deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
                    pointerEvents: 'none'
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 1 }}>
                    <div>
                        <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', marginBottom: '2px' }}>
                            {ex.name}
                        </h3>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'hsl(var(--color-text-muted))', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
                            {ex.bodyPart}
                        </span>
                    </div>
                </div>

                <button
                    style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isAdded ? 'hsl(var(--color-primary))' : 'hsl(var(--color-bg))',
                        color: isAdded ? 'white' : 'hsl(var(--color-primary))',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isAdded ? 'scale(1.1) rotate(360deg)' : 'scale(1)',
                        zIndex: 1
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
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: '700',
                        color: 'hsl(var(--color-text-muted))',
                        marginTop: '0.5rem',
                        marginBottom: '0.25rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        opacity: 0.8
                    }}>
                        Quick Add
                    </h2>
                    {quickAddList.map(renderRow)}
                    <h2 style={{
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: '700',
                        color: 'hsl(var(--color-text-muted))',
                        marginTop: '1rem',
                        marginBottom: '0.25rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        opacity: 0.8
                    }}>
                        All Exercises
                    </h2>
                </>
            )}

            {filtered.map(renderRow)}

            {filtered.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    color: 'hsl(var(--color-text-muted))',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                    opacity: 0.7
                }}>
                    <Dumbbell size={48} style={{ opacity: 0.3 }} />
                    <p style={{ maxWidth: '200px', margin: '0 auto', fontSize: '0.9rem' }}>
                        {filter ? `No matches for "${filter}"` : 'No exercises found.'} <br />
                        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Try a different search or category.</span>
                    </p>
                </div>
            )}
        </div>
    );
}

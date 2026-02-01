import { ChevronLeft, Play, Calendar } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { MOCK_EXERCISES } from '../data/exercises';

export default function TemplatePreview({ template, onBack, onStart }) {
    const { startSession } = useWorkout();

    // Resolve full exercise objects
    const exercises = template.exercises
        .map(id => MOCK_EXERCISES.find(ex => ex.id === id))
        .filter(Boolean);

    const handleStart = () => {
        startSession(template.exercises);
        onStart();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={onBack} style={{ color: 'hsl(var(--color-primary))', padding: '0.5rem', marginLeft: '-0.5rem' }}>
                    <ChevronLeft />
                </button>
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Preview Workout</span>
            </div>

            {/* Hero Card */}
            <div style={{
                backgroundColor: 'hsl(var(--color-surface))',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 'var(--space-lg)',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {template.name}
                </h1>
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    color: 'hsl(var(--color-text-muted))', fontSize: '0.9rem'
                }}>
                    <Calendar size={16} />
                    <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Exercise List */}
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: 'hsl(var(--color-text-muted))' }}>
                Exercises ({exercises.length})
            </h3>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {exercises.map((ex, i) => (
                    <div key={i} style={{
                        padding: '1rem',
                        backgroundColor: 'hsl(var(--color-bg))',
                        borderBottom: '1px solid var(--color-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontWeight: '500' }}>{ex.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'hsl(var(--color-text-muted))' }}>{ex.bodyPart}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Fixed Bottom Button */}
            <div style={{ paddingTop: '1rem' }}>
                <button
                    onClick={handleStart}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        backgroundColor: 'hsl(var(--color-primary))',
                        color: 'white',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <Play size={20} fill="currentColor" />
                    Start Workout
                </button>
            </div>
        </div>
    );
}

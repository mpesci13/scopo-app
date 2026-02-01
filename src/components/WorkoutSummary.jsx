import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import SaveTemplateModal from './SaveTemplateModal';

export default function WorkoutSummary({ session, onHome }) {
    const { saveTemplate, folders, createFolder } = useWorkout();
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    if (!session) return null;

    // Calculate stats
    const durationMinutes = Math.max(1, Math.round((Date.now() - session.startTime) / 60000));

    let totalVolume = 0;
    let totalSets = 0;

    Object.values(session.exercises).forEach(sets => {
        sets.forEach(set => {
            if (set.completed) {
                totalSets++;
                // Only calculate volume if weight and reps exist
                if (set.weight && set.reps) {
                    totalVolume += (parseFloat(set.weight) * parseFloat(set.reps));
                }
            }
        });
    });

    const workRate = Math.round(totalVolume / durationMinutes);

    return (
        <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'hsl(var(--color-primary))',
                color: 'white',
                marginBottom: 'var(--space-lg)',
                boxShadow: '0 0 20px var(--color-primary-glow)'
            }}>
                <CheckCircle size={40} />
            </div>

            <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', marginBottom: 'var(--space-xs)' }}>
                Workout Complete
            </h1>
            <p style={{ color: 'hsl(var(--color-text-muted))', marginBottom: 'var(--space-xl)' }}>
                Great job! Here's your summary.
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-md)',
                marginBottom: 'var(--space-xl)'
            }}>
                <StatCard label="Duration" value={`${durationMinutes} min`} />
                <StatCard label="Volume" value={`${(totalVolume / 1000).toFixed(1)}k lbs`} />
                <StatCard label="Sets" value={totalSets} />
                <StatCard label="Work Rate" value={workRate} />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    onClick={() => setIsSaveModalOpen(true)}
                    style={{
                        flex: 1,
                        padding: '1rem',
                        backgroundColor: 'hsl(var(--color-surface))',
                        color: 'hsl(var(--color-primary))',
                        borderRadius: 'var(--radius-lg)',
                        fontWeight: 'bold',
                        border: '1px solid hsl(var(--color-primary))'
                    }}
                >
                    Save as Workout
                </button>
                <button
                    onClick={onHome}
                    style={{
                        flex: 1,
                        padding: '1rem',
                        backgroundColor: 'hsl(var(--color-primary))',
                        color: 'white',
                        borderRadius: 'var(--radius-lg)',
                        fontWeight: 'bold',
                        border: 'none'
                    }}
                >
                    Finish
                </button>
            </div>
            <SaveTemplateModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onSave={(name, folderId) => {
                    const exerciseIds = Object.keys(session.exercises);
                    saveTemplate(name, exerciseIds, folderId);
                    alert('Workout saved!');
                }}
            />
        </div>
    );
}

function StatCard({ label, value }) {
    return (
        <div style={{
            backgroundColor: 'hsl(var(--color-surface))',
            padding: 'var(--space-md)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'left'
        }}>
            <div style={{ color: 'hsl(var(--color-text-muted))', fontSize: 'var(--font-size-sm)', marginBottom: '4px' }}>
                {label}
            </div>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold' }}>
                {value}
            </div>
        </div>
    );
}

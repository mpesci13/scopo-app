import { useState } from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import SaveTemplateModal from './SaveTemplateModal';

export default function WorkoutSummary({ session, onHome }) {
    const { saveTemplate } = useWorkout();
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    // Editable States
    const [startTime, setStartTime] = useState(() => new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const [endTime, setEndTime] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    if (!session) return null;

    // Calculate stats
    // Note: Duration might be approximate since we are just using current time vs start time from session
    // In a real app we'd parse the edited start/end times to recalulcate duration.
    const durationMinutes = Math.max(1, Math.round((Date.now() - session.startTime) / 60000));

    let totalVolume = 0;
    let totalSets = 0;

    Object.values(session.exercises).forEach(sets => {
        sets.forEach(set => {
            if (set.completed) {
                totalSets++;
                if (set.weight && set.reps) {
                    totalVolume += (parseFloat(set.weight) * parseFloat(set.reps));
                }
            }
        });
    });

    const workRate = Math.round(totalVolume / durationMinutes);

    return (
        <div className="container" style={{ textAlign: 'center', paddingTop: '2rem' }}>
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'hsl(var(--color-primary))',
                color: 'white',
                marginBottom: 'var(--space-md)',
                boxShadow: '0 0 20px var(--color-primary-glow)'
            }}>
                <CheckCircle size={40} />
            </div>

            <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', marginBottom: 'var(--space-md)' }}>
                Workout Complete
            </h1>

            {/* Time Editor */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                marginBottom: 'var(--space-xl)',
                color: 'hsl(var(--color-text-muted))',
                fontSize: '0.9rem'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span>Started</span>
                    <input
                        type="time"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        style={{ background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.2rem', color: 'inherit', textAlign: 'center' }}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span>Ended</span>
                    <input
                        type="time"
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                        style={{ background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.2rem', color: 'inherit', textAlign: 'center' }}
                    />
                </div>
            </div>

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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button
                    onClick={() => setIsSaveModalOpen(true)}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        backgroundColor: 'hsl(var(--color-surface))',
                        color: 'hsl(var(--color-primary))',
                        borderRadius: 'var(--radius-lg)',
                        fontWeight: 'bold',
                        border: '1px solid hsl(var(--color-primary))'
                    }}
                >
                    Save as Routine
                </button>

                <button
                    onClick={() => alert("Sharing enabled soon!")}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        backgroundColor: 'transparent',
                        color: 'hsl(var(--color-text))',
                        borderRadius: 'var(--radius-lg)',
                        fontWeight: 'bold',
                        border: '1px solid var(--color-border)'
                    }}
                >
                    Share to Socials
                </button>

                <button
                    onClick={onHome}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        backgroundColor: 'hsl(var(--color-primary))',
                        color: 'white',
                        borderRadius: 'var(--radius-lg)',
                        fontWeight: 'bold',
                        border: 'none',
                        marginTop: '1rem'
                    }}
                >
                    Return to Library
                </button>
            </div>

            <SaveTemplateModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onSave={(name, folderId) => {
                    const exerciseIds = Object.keys(session.exercises);
                    saveTemplate(name, exerciseIds, folderId);
                    alert('Routine saved!');
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

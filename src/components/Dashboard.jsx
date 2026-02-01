import { Plus, Play, Folder, ChevronRight, Activity } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

export default function Dashboard({ onStartEmpty, onSelectFolder, onResume }) {
    const { session, folders, templates } = useWorkout();

    return (
        <div style={{ padding: '0 0.5rem' }}>
            {/* Main Action Button (Resume or Start) */}
            {session ? (
                <button
                    onClick={onResume}
                    style={{
                        width: '100%',
                        padding: '1.5rem',
                        marginBottom: 'var(--space-xl)',
                        background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, #003388 100%)',
                        color: 'white',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 4px 12px rgba(0, 71, 186, 0.3)',
                        animation: 'pulse 2s infinite'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '40px', height: '40px',
                            borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Activity size={24} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Resume Active Workout</div>
                            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Session in progress</div>
                        </div>
                    </div>
                    <ChevronRight size={24} />
                </button>
            ) : (
                <button
                    onClick={onStartEmpty}
                    style={{
                        width: '100%',
                        padding: '1.5rem',
                        backgroundColor: 'hsl(var(--color-surface))',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: 'var(--space-xl)',
                        transition: 'transform 0.1s active'
                    }}
                >
                    <div style={{
                        width: '40px', height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'hsl(var(--color-primary))',
                        color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Plus size={24} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Start Empty Workout</div>
                        <div style={{ fontSize: '0.9rem', color: 'hsl(var(--color-text-muted))' }}>Build as you go</div>
                    </div>
                </button>
            )}

            {/* Folders Grid */}
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: 'var(--space-md)' }}>Templates</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div
                    onClick={() => onSelectFolder(null)}
                    style={{
                        backgroundColor: 'hsl(var(--color-surface))',
                        padding: '1rem',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        cursor: 'pointer'
                    }}
                >
                    <Folder size={24} color="hsl(var(--color-primary))" />
                    <div style={{ fontWeight: '600' }}>All Workouts</div>
                    <div style={{ fontSize: '0.8rem', color: 'hsl(var(--color-text-muted))' }}>
                        {templates.length} routines
                    </div>
                </div>

                {folders.map(folder => {
                    const count = templates.filter(t => t.folderId === folder.id).length;
                    return (
                        <div
                            key={folder.id}
                            onClick={() => onSelectFolder(folder.id)}
                            style={{
                                backgroundColor: 'hsl(var(--color-surface))',
                                padding: '1rem',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--color-border)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                cursor: 'pointer'
                            }}
                        >
                            <Folder size={24} color="hsl(var(--color-primary))" />
                            <div style={{ fontWeight: '600' }}>{folder.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'hsl(var(--color-text-muted))' }}>
                                {count} routines
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

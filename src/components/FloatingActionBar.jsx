import { Play } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

export default function FloatingActionBar({ onStart, onViewCart }) {
    const { count } = useWorkout();

    if (count === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 2rem)',
            maxWidth: '568px',
            backgroundColor: 'hsla(var(--color-surface), 0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid hsla(var(--color-border), 0.5)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            zIndex: 100,
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
            <div
                onClick={onViewCart}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                }}
            >
                <span style={{
                    backgroundColor: 'hsl(var(--color-primary))',
                    color: '#fff',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                }}>
                    {count}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                    View Workout
                </span>
            </div>

            <button
                onClick={onStart}
                style={{
                    backgroundColor: 'hsl(var(--color-primary))',
                    color: '#fff',
                    padding: '0.5rem 1.25rem',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 0 12px var(--color-primary-glow)',
                }}>
                Start Workout <Play size={16} fill="currentColor" />
            </button>

            <style>{`
        @keyframes slideUp {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
        </div>
    );
}

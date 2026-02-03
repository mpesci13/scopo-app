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
            <button
                onClick={onViewCart}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    backgroundColor: 'hsla(var(--color-primary), 0.1)',
                    padding: '0.5rem 1rem 0.5rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid transparent',
                    transition: 'all 0.2s ease',
                    color: 'hsl(var(--color-primary))'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'hsla(var(--color-primary), 0.15)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'hsla(var(--color-primary), 0.1)'}
            >
                <div style={{
                    backgroundColor: 'hsl(var(--color-primary))',
                    color: '#fff',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    pointerEvents: 'none'
                }}>
                    {count}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', pointerEvents: 'none' }}>
                    View List
                </span>
            </button>

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

import { useEffect, useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';

export default function RestTimer() {
    const { restTimer } = useWorkout();
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (!restTimer) {
            setElapsed(0);
            return;
        }

        const update = () => {
            const now = Date.now();
            const seconds = Math.floor((now - restTimer.startTime) / 1000);
            setElapsed(seconds);
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [restTimer]);

    if (!restTimer) return null;

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const target = restTimer.duration > 0 ? restTimer.duration : 0;
    const isOverTarget = target > 0 && elapsed > target;

    return (
        <div style={{
            position: 'fixed',
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: isOverTarget ? 'hsl(var(--color-warn))' : 'hsl(var(--color-surface))',
            border: '1px solid hsl(var(--color-primary))',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-full)',
            color: isOverTarget ? 'white' : 'hsl(var(--color-primary))',
            fontWeight: 'bold',
            fontSize: 'var(--font-size-sm)',
            zIndex: 200,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
            <span>Rest Timer:</span>
            <span style={{ fontSize: '1.1em' }}>{formatTime(elapsed)}</span>
            {target > 60 && ( // Only show target if it's not the default or distinct? Actually user said "reset to 00:00". Let's show target if relevant.
                <span style={{ opacity: 0.7, fontSize: '0.9em' }}>/ {formatTime(target)}</span>
            )}

            <style>{`
        @keyframes slideDown {
          from { transform: translate(-50%, -100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';

export default function RestTimer() {
    const { restTimer } = useWorkout();
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!restTimer) {
            setTimeLeft(0);
            return;
        }

        const update = () => {
            const elapsed = (Date.now() - restTimer.startTime) / 1000;
            const remaining = Math.max(0, Math.ceil(restTimer.duration - elapsed));
            setTimeLeft(remaining);
        };

        update();
        const interval = setInterval(update, 100);
        return () => clearInterval(interval);
    }, [restTimer]);

    if (!restTimer || timeLeft <= 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'hsl(var(--color-surface))',
            border: '1px solid hsl(var(--color-primary))',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-full)',
            color: 'hsl(var(--color-primary))',
            fontWeight: 'bold',
            fontSize: 'var(--font-size-sm)',
            zIndex: 200,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
            Rest: {timeLeft}s
            <style>{`
        @keyframes slideDown {
          from { transform: translate(-50%, -100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
        </div>
    );
}

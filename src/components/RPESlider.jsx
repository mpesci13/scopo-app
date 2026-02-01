import { useRef } from 'react';

const RPE_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function RPESlider({ value, onChange }) {
    const scrollContainerRef = useRef(null);

    const handleSelect = (rpe) => {
        if (value === rpe) return;

        // Haptic feedback
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(5);
        }

        onChange(rpe);
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            overflowX: 'auto',
            padding: '4px',
            backgroundColor: 'hsl(var(--color-surface))',
            borderRadius: 'var(--radius-full)',
            maxWidth: '100%',
            // Hide scrollbar
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
        }} ref={scrollContainerRef}>
            {RPE_VALUES.map((rpe) => {
                const isActive = value === rpe;

                // Color gradient logic could go here, but request asked for Scopo Blue active state

                return (
                    <button
                        key={rpe}
                        onClick={() => handleSelect(rpe)}
                        style={{
                            minWidth: '44px',
                            height: '44px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: isActive ? 'hsl(var(--color-primary))' : 'transparent',
                            color: isActive ? 'white' : 'hsl(var(--color-text-muted))',
                            fontSize: '1rem',
                            fontWeight: isActive ? 'bold' : 'normal',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
                            flexShrink: 0,
                            boxShadow: isActive ? '0 2px 8px hsl(var(--color-primary-glow))' : 'none'
                        }}
                    >
                        {rpe}
                    </button>
                );
            })}
            <style>{`
                /* Hide scrollbar for Chrome/Safari */
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}

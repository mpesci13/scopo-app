import { useState } from 'react';

const CATEGORIES = ['All', 'Full Body', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];

export default function CategoryChips({ activeCategory, onSelectCategory }) {
    // Local state for demo if not controlled, but usually controlled by parent
    const [selected, setSelected] = useState(activeCategory || 'All');

    const handleSelect = (cat) => {
        setSelected(cat);
        onSelectCategory?.(cat);
    };

    return (
        <div style={{
            display: 'flex',
            gap: 'var(--space-sm)',
            overflowX: 'auto',
            paddingBottom: 'var(--space-sm)',
            marginBottom: 'var(--space-md)',
            // Hide scrollbar but keep functionality
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
        }}>
            {CATEGORIES.map((cat) => {
                const isActive = selected === cat;
                return (
                    <button
                        key={cat}
                        onClick={() => handleSelect(cat)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: isActive ? 'hsl(var(--color-primary))' : 'hsl(var(--color-surface))',
                            color: isActive ? '#fff' : 'hsl(var(--color-text-muted))',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 'var(--font-weight-medium)',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {cat}
                    </button>
                );
            })}
        </div>
    );
}

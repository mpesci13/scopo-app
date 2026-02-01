import { useState } from 'react';

export default function RPEPicker({ value, onChange }) {
    const options = [1, 2, 3, 4, 5];

    return (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', height: '100%' }}>
            {options.map(num => {
                const isSelected = value === num;
                return (
                    <button
                        key={num}
                        onClick={() => onChange(num)}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: `1px solid ${isSelected ? 'hsl(var(--color-primary))' : 'var(--color-border)'}`,
                            backgroundColor: isSelected ? 'hsl(var(--color-primary))' : 'transparent',
                            color: isSelected ? 'white' : 'hsl(var(--color-text-muted))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            padding: 0,
                            paddingBottom: '2px', // optical alignment
                            transition: 'all 0.1s ease',
                            cursor: 'pointer'
                        }}
                    >
                        {num}
                    </button>
                );
            })}
        </div>
    );
}

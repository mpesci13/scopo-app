import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onSearch }) {
    return (
        <div style={{ position: 'relative', marginBottom: 'var(--space-md)' }}>
            <Search
                size={20}
                style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'hsl(var(--color-text-muted))',
                    pointerEvents: 'none'
                }}
            />
            <input
                type="text"
                value={value}
                placeholder="Search exercises..."
                onChange={(e) => onSearch?.(e.target.value)}
                style={{
                    width: '100%',
                    padding: '1rem 3rem 1rem 3rem', // Extra padding right for X button
                    backgroundColor: 'hsl(var(--color-surface))',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--font-size-base)',
                    color: 'hsl(var(--color-text))',
                    border: '1px solid transparent',
                    transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = 'hsl(var(--color-primary))';
                    e.target.style.backgroundColor = 'hsl(var(--color-surface-hover))';
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = 'transparent';
                    e.target.style.backgroundColor = 'hsl(var(--color-surface))';
                }}
            />
            {value && (
                <button
                    onClick={() => onSearch?.('')}
                    style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        padding: '0.25rem',
                        color: 'hsl(var(--color-text-muted))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <X size={18} />
                </button>
            )}
        </div>
    );
}

import { createContext, useContext, useState, useEffect } from 'react';

const WorkoutContext = createContext();

export function WorkoutProvider({ children }) {
    const [cart, setCart] = useState(() => {
        // Load from local storage on init
        try {
            const saved = localStorage.getItem('scopo-cart');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch (e) {
            return new Set();
        }
    });

    // Save to local storage whenever cart changes
    useEffect(() => {
        const array = Array.from(cart);
        localStorage.setItem('scopo-cart', JSON.stringify(array));
    }, [cart]);

    const toggleExercise = (id) => {
        setCart(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const clearCart = () => setCart(new Set());

    return (
        <WorkoutContext.Provider value={{
            cart,
            toggleExercise,
            clearCart,
            count: cart.size
        }}>
            {children}
        </WorkoutContext.Provider>
    );
}

export function useWorkout() {
    const context = useContext(WorkoutContext);
    if (!context) {
        throw new Error('useWorkout must be used within a WorkoutProvider');
    }
    return context;
}

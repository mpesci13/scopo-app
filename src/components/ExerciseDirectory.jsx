import React, { useState } from 'react';
import { Search, Plus, Check } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

const ExerciseDirectory = () => {
    const { exercises, addToCart, cart } = useWorkout();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredExercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isInCart = (id) => cart.some(item => item.id === id);

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-white/10">
            {/* Search Header */}
            <div className="p-4 border-b border-white/10 sticky top-0 bg-[#0a0a0a] z-10">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search exercises..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-primary outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredExercises.map(ex => (
                    <div key={ex.id} className="group flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-all border border-transparent hover:border-white/5">
                        <div>
                            <p className="font-medium text-white/90">{ex.name}</p>
                            <p className="text-xs text-white/40">{ex.category}</p>
                        </div>
                        <button
                            onClick={() => addToCart(ex)}
                            disabled={isInCart(ex.id)}
                            className={`p-2 rounded-full transition-all ${isInCart(ex.id)
                                ? 'bg-green-500/10 text-green-500 cursor-default'
                                : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                                }`}
                        >
                            {isInCart(ex.id) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                    </div>
                ))}

                {filteredExercises.length === 0 && (
                    <div className="text-center py-10 text-white/30 text-sm">
                        No exercises found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExerciseDirectory;

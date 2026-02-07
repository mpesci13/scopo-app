import React, { useState, useMemo } from 'react';
import { Search, Plus, Check, X } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import StagingTray from './shopping-cart/StagingTray';
import Fuse from 'fuse.js';

const ExerciseDirectory = ({ onFinishSelection }) => {
    const { exercises, addToCart, removeFromCart, cart } = useWorkout();
    const [searchTerm, setSearchTerm] = useState('');

    // Fuse.js Configuration
    const fuse = useMemo(() => {
        return new Fuse(exercises, {
            keys: ['name', 'category', 'tags'],
            threshold: 0.3, // Tolerance for typos
            distance: 100,
        });
    }, [exercises]);

    const filteredExercises = useMemo(() => {
        if (!searchTerm) return exercises;
        return fuse.search(searchTerm).map(result => result.item);
    }, [searchTerm, exercises, fuse]);

    const isInCart = (id) => cart.some(item => item.id === id);

    const toggleSelection = (e, ex) => {
        e.stopPropagation();
        if (isInCart(ex.id)) {
            removeFromCart(ex.id);
        } else {
            addToCart(ex);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-white/10 relative overflow-hidden">
            {/* Search Header */}
            <div className="p-4 border-b border-white/10 sticky top-0 bg-[#0a0a0a] z-10">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search exercises..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-2 text-sm text-white focus:border-primary outline-none transition-colors"
                        autoFocus
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-32"> {/* Extra padding for footer */}
                {filteredExercises.map(ex => {
                    const selected = isInCart(ex.id);
                    return (
                        <div
                            key={ex.id}
                            onClick={(e) => toggleSelection(e, ex)}
                            className={`group flex items-center justify-between p-3 rounded-lg transition-all border cursor-pointer ${selected
                                ? 'bg-blue-500/10 border-blue-500/20'
                                : 'border-transparent hover:bg-white/5 hover:border-white/5'
                                }`}
                        >
                            <div>
                                <p className={`font-medium ${selected ? 'text-white' : 'text-white/90'}`}>{ex.name}</p>
                                <p className="text-xs text-white/40">{ex.category}</p>
                            </div>
                            <button
                                className={`p-2 rounded-full transition-all ${selected
                                    ? 'bg-blue-500 text-white shadow-sm'
                                    : 'bg-white/5 text-white/40'
                                    }`}
                            >
                                {selected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            </button>
                        </div>
                    );
                })}

                {filteredExercises.length === 0 && (
                    <div className="text-center py-10 text-white/30 text-sm">
                        No exercises found.
                    </div>
                )}
            </div>

            {/* Staging Tray */}
            <StagingTray onStartWorkout={onFinishSelection} />
        </div>
    );
};

export default ExerciseDirectory;

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Plus, Check, X, ChevronDown } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import StagingTray from './shopping-cart/StagingTray';
import Fuse from 'fuse.js';

const FILTER_BODY_PARTS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
const FILTER_TYPES = ['Barbell', 'Dumbbell', 'Machine', 'Bodyweight', 'Cardio', 'Timed'];

const FilterDropdown = ({ label, options, selected, onSelect, onClear }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        onSelect(option);
        setIsOpen(false);
    };

    const isActive = !!selected;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Pill */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${isActive
                    ? 'bg-primary border-primary text-white shadow-[0_2px_10px_rgba(0,46,93,0.4)]'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
            >
                <span className="whitespace-nowrap">{selected || label}</span>
                {isActive ? (
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            onClear();
                        }}
                        className="p-0.5 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </div>
                ) : (
                    <ChevronDown className="w-4 h-4 opacity-50" />
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                    <div className="max-h-60 overflow-y-auto py-1">
                        <button
                            onClick={() => handleSelect(null)}
                            className="w-full text-left px-4 py-3 text-white/40 text-sm hover:bg-white/5 transition-colors border-b border-white/5"
                        >
                            All {label}s
                        </button>
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => handleSelect(option)}
                                className={`w-full text-left px-4 py-3 text-sm transition-colors ${selected === option
                                    ? 'bg-primary/20 text-primary font-semibold'
                                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ExerciseDirectory = ({ onFinishSelection }) => {
    const { exercises, addToCart, removeFromCart, cart } = useWorkout();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBodyPart, setSelectedBodyPart] = useState(null);
    const [selectedType, setSelectedType] = useState(null);

    // Fuse.js Configuration
    const fuse = useMemo(() => {
        return new Fuse(exercises, {
            keys: ['name', 'bodyPart', 'type', 'tags'],
            threshold: 0.3,
            distance: 100,
        });
    }, [exercises]);

    const filteredExercises = useMemo(() => {
        // Start with all exercises
        let result = exercises;

        // 1. Fuzzy Search (Narrow down first if search exists)
        if (searchTerm) {
            result = fuse.search(searchTerm).map(r => r.item);
        }

        // 2. Strict Intersection Filtering
        return result.filter(ex => {
            const matchesBodyPart = !selectedBodyPart || (ex.bodyPart && ex.bodyPart.toLowerCase() === selectedBodyPart.toLowerCase());
            const matchesType = !selectedType || (ex.type && ex.type.toLowerCase() === selectedType.toLowerCase());
            return matchesBodyPart && matchesType;
        });
    }, [searchTerm, selectedBodyPart, selectedType, exercises, fuse]);

    const isInCart = (id) => cart.some(item => item.id === id);

    const toggleSelection = (e, ex) => {
        e.stopPropagation();
        if (isInCart(ex.id)) {
            removeFromCart(ex.id);
        } else {
            addToCart(ex);
        }
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        setSelectedBodyPart(null);
        setSelectedType(null);
    };

    const hasActiveFilters = searchTerm || selectedBodyPart || selectedType;

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-white/10 relative overflow-hidden">
            {/* Search Header */}
            <div className="p-4 border-b border-white/10 sticky top-0 bg-[#0a0a0a] z-10 space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search exercises..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-3 text-base text-white focus:border-primary outline-none transition-colors placeholder:text-white/20"
                        autoFocus
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Filters Row */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex gap-3">
                        <FilterDropdown
                            label="Body Part"
                            options={FILTER_BODY_PARTS}
                            selected={selectedBodyPart}
                            onSelect={setSelectedBodyPart}
                            onClear={() => setSelectedBodyPart(null)}
                        />
                        <FilterDropdown
                            label="Type"
                            options={FILTER_TYPES}
                            selected={selectedType}
                            onSelect={setSelectedType}
                            onClear={() => setSelectedType(null)}
                        />
                    </div>

                    {/* Clear All Button (Only visible if filters active) */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            className="text-xs text-red-400 hover:text-red-300 font-medium whitespace-nowrap px-2 py-1 hover:bg-red-400/10 rounded-md transition-colors"
                        >
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-32">
                {filteredExercises.map(ex => {
                    const selected = isInCart(ex.id);
                    return (
                        <div
                            key={ex.id}
                            onClick={(e) => toggleSelection(e, ex)}
                            className={`group flex items-center justify-between p-3 rounded-xl transition-all border cursor-pointer ${selected
                                ? 'bg-blue-500/10 border-blue-500/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]'
                                : 'border-transparent hover:bg-white/5 hover:border-white/5'
                                }`}
                        >
                            <div className="flex-1">
                                <p className={`font-medium text-base ${selected ? 'text-white' : 'text-white/90'}`}>{ex.name}</p>
                                <div className="flex gap-2 text-xs text-white/40 mt-1">
                                    <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide border border-white/5">{ex.bodyPart}</span>
                                    <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide border border-white/5">{ex.type}</span>
                                </div>
                            </div>
                            <button
                                className={`h-8 w-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ml-3 ${selected
                                    ? 'bg-blue-500 text-white shadow-sm scale-110'
                                    : 'bg-white/5 text-white/40'
                                    }`}
                            >
                                {selected ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            </button>
                        </div>
                    );
                })}

                {filteredExercises.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-white/30 space-y-3">
                        <Search className="w-10 h-10 opacity-20" />
                        <p className="text-sm">No exercises found.</p>
                        <button
                            onClick={clearAllFilters}
                            className="text-primary text-xs hover:underline"
                        >
                            Clear filters to see all
                        </button>
                    </div>
                )}
            </div>

            {/* Staging Tray */}
            <StagingTray onStartWorkout={onFinishSelection} />
        </div>
    );
};

export default ExerciseDirectory;

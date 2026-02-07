import React, { useState } from 'react';
import { X, Trash2, GripVertical, ChevronUp } from 'lucide-react';
import { useWorkout } from '../../context/WorkoutContext';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    TouchSensor
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Item Component
const SortableItem = ({ item, onRemove }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 touch-none ${isDragging ? 'bg-white/10 ring-1 ring-primary/50 shadow-xl' : ''
                }`}
        >
            {/* Drag Handle & Content Area */}
            <div
                className="flex items-center gap-3 flex-1 cursor-grab active:cursor-grabbing"
                {...attributes}
                {...listeners}
            >
                <div className="text-white/20">
                    <GripVertical className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-white select-none">{item.name}</p>
                    <p className="text-xs text-white/40 select-none">{item.category}</p>
                </div>
            </div>

            {/* Remove Action - Prevent drag propagation */}
            <button
                onPointerDown={(e) => e.stopPropagation()} // Stop drag start
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(item.id);
                }}
                className="p-2 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
};

const StagingTray = ({ onStartWorkout }) => {
    const { cart, removeFromCart, reorderCart } = useWorkout();
    const [isOpen, setIsOpen] = useState(false);

    // Sensors for drag detection
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Requires 8px movement to start drag (prevents accidental drags)
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = cart.findIndex((item) => item.id === active.id);
            const newIndex = cart.findIndex((item) => item.id === over.id);
            reorderCart(oldIndex, newIndex);
        }
    };

    if (cart.length === 0) return null;

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] animate-fade-in"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer Container */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-[100] transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
            >
                <div className="bg-[#111] border-t border-white/10 rounded-t-[20px] shadow-2xl pb-safe">
                    <div className="p-4 space-y-4 max-h-[75vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <h3 className="text-lg font-bold text-white">Selected Exercises ({cart.length})</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 -mr-2 text-white/40 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Draggable List */}
                        <div className="flex-1 overflow-y-auto min-h-0 py-2">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={cart.map(item => item.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-2">
                                        {cart.map((item) => (
                                            <SortableItem
                                                key={item.id}
                                                item={item}
                                                onRemove={removeFromCart}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                onStartWorkout();
                            }}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-[0_4px_20px_rgba(0,46,93,0.4)] active:scale-95 transition-all text-base"
                        >
                            Start Workout
                        </button>
                    </div>
                </div>
            </div>

            {/* Closed State - Floating Bar */}
            <div
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-[80px] left-4 right-4 z-[100] bg-primary rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 cursor-pointer overflow-hidden transition-all duration-300 ${isOpen ? 'translate-y-[200%] opacity-0' : 'translate-y-0 opacity-100'}`}
            >
                <div className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors">
                    <div className="flex flex-col">
                        <span className="font-bold text-white text-lg">
                            {cart.length} {cart.length === 1 ? 'Exercise' : 'Exercises'}
                        </span>
                        <span className="text-xs text-white/60">Tap to review & start</span>
                    </div>

                    <div className="flex items-center gap-2 text-white/80 bg-white/10 px-3 py-1.5 rounded-lg">
                        <span className="text-xs font-bold uppercase tracking-wider">Review</span>
                        <ChevronUp className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </>
    );
};

export default StagingTray;

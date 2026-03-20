import React, { useState } from 'react';
import { Plus, ChevronsDown, ChevronsUp, AlertTriangle, X as XIcon, Save } from 'lucide-react';
import { useWorkout } from '../../context/WorkoutContext';
import ExerciseCard from '../active-session/ExerciseCard';

const TemplateBuilder = ({ initialTemplate, onBack, onAddExercise, onSaveComplete }) => {
    const { cart, removeFromCart, updateCartItem, saveTemplate, updateTemplate, deleteTemplate, clearCart, routines } = useWorkout();
    
    // Global Expand/Collapse Logic
    const [expandedIds, setExpandedIds] = useState(() => new Set());

    const toggleExpand = (id) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedIds(newSet);
    };

    const expandAll = () => {
        const allIds = new Set(cart.map(item => item.id));
        setExpandedIds(allIds);
    };

    const collapseAll = () => {
        setExpandedIds(new Set());
    };

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    
    const [templateName, setTemplateName] = useState(initialTemplate ? initialTemplate.name : '');
    const [selectedRoutineId, setSelectedRoutineId] = useState(initialTemplate ? initialTemplate.folderId : null);

    const isDuplicateName = () => {
        if (!templateName.trim()) return false;
        const nameToCheck = templateName.trim().toLowerCase();
        
        if (initialTemplate && nameToCheck === initialTemplate.name.toLowerCase()) {
            return false;
        }

        return routines.some(routine => 
            routine.templates && routine.templates.some(t => t.name.toLowerCase() === nameToCheck)
        );
    };

    const handleSave = () => {
        if (!templateName.trim() || isDuplicateName() || !selectedRoutineId || cart.length === 0) return;
        
        if (initialTemplate) {
            updateTemplate(initialTemplate.folderId, selectedRoutineId, initialTemplate.id, templateName, cart);
        } else {
            saveTemplate(templateName, selectedRoutineId);
        }
        clearCart();
        onSaveComplete(selectedRoutineId);
    };

    const handleDelete = () => {
        if (initialTemplate) {
            deleteTemplate(initialTemplate.folderId, initialTemplate.id);
            clearCart();
            onBack();
        }
    };

    const confirmCancel = () => {
        clearCart();
        onBack();
    };

    return (
        <div className="fixed inset-0 flex flex-col bg-[#0a0a0a] z-50">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 pt-12 border-b border-white/5 bg-[#0a0a0a] z-10 w-full shrink-0 h-24">
                <button
                    onClick={() => setShowCancelModal(true)}
                    className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors w-16 text-left shrink-0"
                >
                    Cancel
                </button>

                <div className="flex flex-col items-center flex-1">
                    <span className="text-xl font-black text-white tracking-widest leading-none">
                        {initialTemplate ? 'Editor' : 'Builder'}
                    </span>
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider mt-1">
                        Template
                    </span>
                </div>

                <div className="flex items-center gap-2 w-20 justify-end shrink-0">
                    <button
                        onClick={collapseAll}
                        className="text-white/40 hover:text-white transition-colors"
                        title="Collapse All"
                    >
                        <ChevronsUp className="w-5 h-5" />
                    </button>
                    <button
                        onClick={expandAll}
                        className="text-white/40 hover:text-white transition-colors"
                        title="Expand All"
                    >
                        <ChevronsDown className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto space-y-4 p-4 pb-48 touch-pan-y">
                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
                        <button 
                            onClick={onAddExercise} 
                            className="p-8 bg-white/5 hover:bg-white/10 rounded-full transition-all active:scale-95 border border-white/10"
                        >
                            <Plus className="w-16 h-16 text-white/40" />
                        </button>
                        <p className="text-white/40 font-medium">Tap to add your first exercise.</p>
                    </div>
                ) : (
                    cart.map(exercise => (
                        <ExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            isExpanded={expandedIds.has(exercise.id)}
                            onToggleExpand={() => toggleExpand(exercise.id)}
                            onRemove={() => removeFromCart(exercise.id)}
                            onUpdateSets={(newSets) => updateCartItem(exercise.id, { sets: newSets })}
                            isBuilderMode={true}
                        />
                    ))
                )}

                {/* Inline Footer Actions */}
                <div className="mt-8 flex flex-col gap-3">
                    {cart.length > 0 && (
                        <>
                            <button
                                onClick={onAddExercise}
                                className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                Add Exercise
                            </button>

                            <button
                                onClick={() => setShowSaveModal(true)}
                                className="py-4 w-full bg-[#002E5D] text-white font-bold rounded-2xl text-sm uppercase tracking-wide shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                Save Template
                            </button>

                            {initialTemplate && (
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="py-4 w-full bg-red-500/10 text-red-500 font-bold rounded-2xl text-sm uppercase tracking-wide transition-all active:scale-95 mt-4"
                                >
                                    Delete Template
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 flex items-center justify-center z-[60] bg-black/80 backdrop-blur-sm animate-fade-in p-6">
                    <div className="bg-[#1a1a1a] border border-red-500/20 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl relative">
                        <div className="flex items-center gap-3 text-red-500">
                            <AlertTriangle className="w-6 h-6" />
                            <h3 className="text-lg font-bold">Discard Changes?</h3>
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Are you sure? This will <strong className="text-white">delete all exercises</strong> from your draft.
                        </p>
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                            >
                                Continue
                            </button>
                            <button
                                onClick={confirmCancel}
                                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors shadow-lg"
                            >
                                Discard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center z-[60] bg-black/80 backdrop-blur-sm animate-fade-in p-6">
                    <div className="bg-[#1a1a1a] border border-red-500/20 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl relative">
                        <div className="flex items-center gap-3 text-red-500">
                            <AlertTriangle className="w-6 h-6" />
                            <h3 className="text-lg font-bold">Delete Template?</h3>
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Are you sure you want to permanently delete this template?
                        </p>
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors shadow-lg"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 flex flex-col justify-end z-[100]">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowSaveModal(false)} />
                    <div className="bg-[#111] border-t border-white/10 rounded-t-2xl w-full px-6 pt-6 pb-32 sm:pb-12 animate-slide-up shadow-2xl relative z-10 max-h-[85vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Save Template</h3>
                            <button onClick={() => setShowSaveModal(false)} className="text-white/40 hover:text-white">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Template Name"
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    className={`w-full h-12 bg-white/5 border rounded-xl px-4 text-white focus:outline-none transition-colors ${isDuplicateName() ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary'}`}
                                    autoFocus
                                />
                                {isDuplicateName() && (
                                    <p className="text-red-500 text-xs font-medium mt-2 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        Template name already exists. Please choose a different name.
                                    </p>
                                )}
                            </div>

                            {/* Folder Selection */}
                            <div className="pt-2">
                                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 px-1">Save to Library Folder</h4>
                                <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 px-1 -mx-2 sm:mx-0 sm:px-0">
                                    <div className="w-2 shrink-0 sm:hidden"></div>
                                    {routines.map(routine => (
                                        <button
                                            key={routine.id}
                                            onClick={() => setSelectedRoutineId(routine.id)}
                                            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 whitespace-nowrap ${
                                                selectedRoutineId === routine.id
                                                    ? 'bg-primary text-white shadow-[0_0_15px_rgba(0,46,93,0.5)]'
                                                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                                            }`}
                                        >
                                            {routine.name}
                                        </button>
                                    ))}
                                    <div className="w-2 shrink-0 sm:hidden"></div>
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={!templateName.trim() || isDuplicateName() || !selectedRoutineId}
                                className="w-full mt-4 h-14 bg-[#002E5D] text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(0,46,93,0.4)] disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
                            >
                                Save to Library
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplateBuilder;

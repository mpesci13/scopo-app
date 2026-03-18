import React, { useState } from 'react';
import { ChevronLeft, Play, Edit2, Plus, Trash2, AlertTriangle, Search } from 'lucide-react';
import { useWorkout } from '../../context/WorkoutContext';

const FolderDetailView = ({ folder, onBack, onStartTemplate }) => {
    const { deleteTemplate, updateTemplateLastUsed } = useWorkout();
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [templateToDelete, setTemplateToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTemplates = [...(folder.templates || [])].filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
        const dateA = a.lastUsed || a.createdAt;
        const dateB = b.lastUsed || b.createdAt;
        return new Date(dateB) - new Date(dateA);
    });

    const confirmDelete = () => {
        if (templateToDelete) {
            deleteTemplate(folder.id, templateToDelete.id);
            setTemplateToDelete(null);
        }
    };

    const toggleExpand = (id) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedIds(newSet);
    };
    return (
        <div className="h-full flex flex-col animate-slide-in-right">
            <div className="flex items-center gap-4 mb-4 w-full pr-4">
                <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors shrink-0">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-white truncate flex-1">{folder.name}</h2>
            </div>
            
            {/* Search Bar */}
            {folder.templates?.length > 0 && (
                <div className="mb-6 relative mx-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input 
                        type="text" 
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder:text-white/30"
                    />
                </div>
            )}

            <div className="flex-1 space-y-5 overflow-y-auto pb-safe px-4 sm:px-0">
                {filteredTemplates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-white/30 space-y-6 mx-1">
                        <div className="p-4 bg-primary/10 rounded-full text-primary mb-2">
                            <Plus className="w-8 h-8" />
                        </div>
                        <p className="text-center font-medium opacity-60">No templates here yet.<br />Build one to get started!</p>
                        <button className="px-6 py-3 bg-primary rounded-xl text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                            + Build New Template
                        </button>
                    </div>
                ) : (
                    filteredTemplates.map(template => {
                        const isExpanded = expandedIds.has(template.id);
                        const visibleExercises = isExpanded ? template.exercises : template.exercises.slice(0, 4);

                        return (
                            <div key={template.id} className="p-5 bg-[#111] border border-white/10 rounded-[28px] space-y-5 shadow-2xl relative overflow-hidden group">
                                
                                {/* Subtle Gradient Backdrop */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] pointer-events-none opacity-50"></div>

                                {/* Header */}
                                <div className="flex items-start justify-between gap-4 relative z-10">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-black text-white truncate w-full drop-shadow-md">{template.name}</h3>
                                        <div className="mt-2 space-y-1">
                                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                                <span>{template.exercises.length} Exercises</span>
                                            </p>
                                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-2 flex-wrap leading-relaxed">
                                                <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
                                                {template.lastUsed && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-white/20 shrink-0"></span>
                                                        <span className="text-primary/90 font-black">Used {new Date(template.lastUsed).toLocaleDateString()}</span>
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                            {/* Exercises List (Agenda Style) */}
                                <div className="bg-white/[0.03] rounded-2xl p-4 space-y-3.5 border border-white/5 relative z-10 transition-all duration-300">
                                    {visibleExercises.map((ex, i) => (
                                        <div key={i} className="flex items-center gap-3 animate-fade-in">
                                            <span className="text-xs font-bold text-white/20 w-4 text-right shrink-0">{i + 1}</span>
                                            <span className="text-sm font-bold text-white/80 truncate flex-1">{ex.name}</span>
                                            {ex.sets?.length > 0 && (
                                                <span className="text-[10px] font-bold text-white/30 uppercase bg-white/5 px-2 py-1 rounded-md shrink-0">
                                                    {ex.sets.length} Set{ex.sets.length !== 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                    {template.exercises.length > 4 && (
                                        <div className="pt-2 text-center border-t border-white/5 mt-3 relative">
                                            <button 
                                                onClick={() => toggleExpand(template.id)}
                                                className="text-[10px] font-bold text-white/30 hover:text-white uppercase tracking-widest bg-[#111] px-3 relative -top-4 transition-colors p-1"
                                            >
                                                {isExpanded ? 'Show Less' : `+ ${template.exercises.length - 4} More`}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Bottom Actions */}
                                <div className="grid grid-cols-3 gap-2 pt-3 relative z-10 w-full">
                                    <button className="flex items-center justify-center gap-1.5 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold text-white transition-colors uppercase tracking-widest">
                                        <Edit2 className="w-3 h-3" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setTemplateToDelete(template);
                                        }}
                                        className="flex items-center justify-center gap-1.5 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-[10px] font-bold transition-colors uppercase tracking-widest"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => {
                                            updateTemplateLastUsed(folder.id, template.id);
                                            onStartTemplate(template);
                                        }}
                                        className="flex items-center justify-center gap-1.5 py-3 bg-primary hover:bg-primary/90 rounded-xl text-[10px] font-bold text-white shadow-lg shadow-primary/20 transition-all active:scale-95 uppercase tracking-widest"
                                    >
                                        <Play className="w-3 h-3 fill-current" />
                                        Start
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {templateToDelete && (
                <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/80 backdrop-blur-sm animate-fade-in p-6">
                    <div className="bg-[#1a1a1a] border border-red-500/20 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl relative">
                        <div className="flex items-center gap-3 text-red-500">
                            <AlertTriangle className="w-6 h-6" />
                            <h3 className="text-lg font-bold">Delete Template?</h3>
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Are you sure you want to delete <strong className="text-white">{templateToDelete.name}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => setTemplateToDelete(null)}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors shadow-lg"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FolderDetailView;

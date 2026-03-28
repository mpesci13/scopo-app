import React, { useState } from 'react';
import { ChevronLeft, Plus, AlertTriangle, Search } from 'lucide-react';
import { useWorkout } from '../../context/WorkoutContext';
import TemplateCard from './TemplateCard';

const FolderDetailView = ({ folder, onBack, onStartTemplate, onEditTemplate }) => {
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
                    searchQuery ? (
                        <div className="flex flex-col items-center justify-center h-64 text-white/30 space-y-4 mx-1">
                            <Search className="w-8 h-8 opacity-50" />
                            <p className="text-center font-medium opacity-60 text-sm">No matches found for "{searchQuery}"</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-white/30 space-y-6 mx-1">
                            <div className="p-4 bg-primary/10 rounded-full text-primary mb-2">
                                <Plus className="w-8 h-8" />
                            </div>
                            <p className="text-center font-medium opacity-60">No templates here yet.<br />Build one to get started!</p>
                            <button className="px-6 py-3 bg-primary rounded-xl text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                                + Build New Template
                            </button>
                        </div>
                    )
                ) : (
                    filteredTemplates.map(template => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            folder={null} // Don't need folder name in folder view
                            isExpanded={expandedIds.has(template.id)}
                            onToggleExpand={toggleExpand}
                            onEdit={onEditTemplate}
                            onDelete={() => setTemplateToDelete(template)}
                            onStart={(t) => {
                                updateTemplateLastUsed(folder.id, t.id);
                                onStartTemplate(t);
                            }}
                        />
                    ))
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

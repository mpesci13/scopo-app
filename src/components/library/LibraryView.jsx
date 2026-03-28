import React, { useState } from 'react';
import { Folder, ChevronLeft, Plus, X, Search, AlertTriangle } from 'lucide-react';
import { useWorkout } from '../../context/WorkoutContext';
import TemplateCard from './TemplateCard';

const LibraryView = ({ onBack, routines, onSelectFolder, onStartTemplate, onEditTemplate }) => {
    const { addRoutine, deleteTemplate, updateTemplateLastUsed } = useWorkout();
    const [showAddModal, setShowAddModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [templateToDelete, setTemplateToDelete] = useState(null);

    const handleAddFolder = () => {
        if (!newFolderName.trim()) return;
        addRoutine(newFolderName.trim());
        setNewFolderName('');
        setShowAddModal(false);
    };

    const confirmDelete = () => {
        if (templateToDelete) {
            deleteTemplate(templateToDelete.folderId, templateToDelete.id);
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

    // Global Search Logic
    const allTemplates = routines.flatMap(r => 
        (r.templates || []).map(t => ({ ...t, folderName: r.name, folderId: r.id }))
    );

    const filteredTemplates = allTemplates
        .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            const dateA = a.lastUsed || a.createdAt;
            const dateB = b.lastUsed || b.createdAt;
            return new Date(dateB) - new Date(dateA);
        });

    return (
        <div className="h-full flex flex-col animate-slide-in-right">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-white">My Library</h2>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                    type="text" 
                    placeholder="Search all templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder:text-white/30"
                />
            </div>

            <div className="flex-1 overflow-y-auto pb-safe">
                {searchQuery ? (
                    filteredTemplates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-white/30 space-y-4">
                            <Search className="w-8 h-8 opacity-50" />
                            <p className="text-center font-medium opacity-60 text-sm">No templates found for "{searchQuery}"</p>
                        </div>
                    ) : (
                        <div className="space-y-5 px-1 pb-4">
                            {filteredTemplates.map(template => (
                                <TemplateCard
                                    key={`${template.folderId}-${template.id}`}
                                    template={template}
                                    folder={{ name: template.folderName }}
                                    isExpanded={expandedIds.has(template.id)}
                                    onToggleExpand={toggleExpand}
                                    onEdit={onEditTemplate}
                                    onDelete={(t) => setTemplateToDelete(t)}
                                    onStart={(t) => {
                                        updateTemplateLastUsed(t.folderId, t.id);
                                        onStartTemplate(t);
                                    }}
                                />
                            ))}
                        </div>
                    )
                ) : (
                    <div className="grid grid-cols-2 gap-4 auto-rows-fr px-1 pb-4">
                        {routines.map(routine => (
                            <button
                                key={routine.id}
                                onClick={() => onSelectFolder(routine)}
                                className="flex flex-col justify-between p-5 bg-white/5 border border-white/10 rounded-[20px] hover:bg-white/10 hover:border-primary/30 transition-all group active:scale-[0.98] min-h-[140px]"
                            >
                                <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors w-fit">
                                    <Folder className="w-6 h-6" />
                                </div>
                                <div className="text-left mt-4 w-full overflow-hidden">
                                    <h3 className="font-bold text-white text-lg leading-tight truncate w-full">{routine.name}</h3>
                                    <p className="text-xs text-white/40 mt-1">{routine.templates?.length || 0} Workouts</p>
                                </div>
                            </button>
                        ))}

                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="flex flex-col items-center justify-center p-5 border border-dashed border-white/20 rounded-[20px] text-white/40 hover:text-white hover:border-white/40 transition-colors min-h-[140px]"
                        >
                            <Plus className="w-6 h-6 mb-2" />
                            <span className="font-medium text-sm">Add Folder</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Folder Creation Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddModal(false)} />
                    <div className="relative z-10 bg-[#111] border-t border-white/10 rounded-t-2xl px-6 pt-6 pb-32 sm:pb-12 w-full animate-slide-up shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">New Folder</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <input
                            type="text"
                            placeholder="Folder Name (e.g. Pull Days)"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder-white/20 focus:border-primary outline-none transition-colors mb-6"
                            autoFocus
                        />
                        <button
                            onClick={handleAddFolder}
                            disabled={!newFolderName.trim()}
                            className="w-full h-14 bg-primary text-white font-bold rounded-xl transition-all active:scale-[0.98] shadow-[0_4px_20px_rgba(0,46,93,0.4)] disabled:opacity-50 disabled:shadow-none"
                        >
                            Create Folder
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {templateToDelete && (
                <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/80 backdrop-blur-sm animate-fade-in p-6">
                    <div className="bg-[#1a1a1a] border border-red-500/20 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl relative">
                        <div className="flex items-center gap-3 text-red-500">
                            <AlertTriangle className="w-6 h-6" />
                            <h3 className="text-lg font-bold">Delete Template?</h3>
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Are you sure you want to delete <strong className="text-white">{templateToDelete.name}</strong> from <strong className="text-white">{templateToDelete.folderName}</strong>? This action cannot be undone.
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

export default LibraryView;

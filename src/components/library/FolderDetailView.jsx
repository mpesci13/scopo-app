import React from 'react';
import { ChevronLeft, Play, Edit2, Plus } from 'lucide-react';

const FolderDetailView = ({ folder, onBack, onStartTemplate }) => {
    return (
        <div className="h-full flex flex-col animate-slide-in-right">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-white">{folder.name}</h2>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pb-safe">
                {folder.templates.length === 0 ? (
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
                    folder.templates.map(template => (
                        <div key={template.id} className="p-5 bg-[#111] border border-white/10 rounded-[20px] space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">{template.name}</h3>
                                <p className="text-xs text-white/40 mt-1">
                                    {template.exercises.length} Exercises • {new Date(template.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {template.exercises.slice(0, 3).map((ex, i) => (
                                    <span key={i} className="px-2 py-1 bg-white/5 rounded-md text-[10px] text-white/60">
                                        {ex.name}
                                    </span>
                                ))}
                                {template.exercises.length > 3 && (
                                    <span className="px-2 py-1 bg-white/5 rounded-md text-[10px] text-white/40">
                                        +{template.exercises.length - 3} more
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button className="flex items-center justify-center gap-2 py-3 bg-white/5 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => onStartTemplate(template)}
                                    className="flex items-center justify-center gap-2 py-3 bg-primary rounded-xl text-sm font-bold text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                                >
                                    <Play className="w-4 h-4 fill-current" />
                                    Start
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FolderDetailView;

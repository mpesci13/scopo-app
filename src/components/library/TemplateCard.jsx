import React from 'react';
import { Play, Edit2, Trash2 } from 'lucide-react';

const TemplateCard = ({ template, folder, isExpanded, onToggleExpand, onEdit, onDelete, onStart }) => {
    const visibleExercises = isExpanded ? template.exercises : template.exercises.slice(0, 4);

    return (
        <div className="p-5 bg-[#111] border border-white/10 rounded-[28px] space-y-5 shadow-2xl relative overflow-hidden group">
            {/* Subtle Gradient Backdrop */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] pointer-events-none opacity-50"></div>

            {/* Header */}
            <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-black text-white truncate w-full drop-shadow-md">{template.name}</h3>
                    <div className="mt-2 space-y-1">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                            <span>{template.exercises.length} Exercises</span>
                            {folder && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-white/20 shrink-0"></span>
                                    <span className="truncate">{folder.name}</span>
                                </>
                            )}
                        </p>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-2 flex-wrap leading-relaxed">
                            <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
                            <span className="w-1 h-1 rounded-full bg-white/20 shrink-0"></span>
                            {template.lastUsed ? (
                                <span className="text-primary/90 font-black">Used {new Date(template.lastUsed).toLocaleDateString()}</span>
                            ) : (
                                <span className="text-white/20 font-black">Never Used</span>
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
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleExpand(template.id);
                            }}
                            className="text-[10px] font-bold text-white/30 hover:text-white uppercase tracking-widest bg-[#111] px-3 relative -top-4 transition-colors p-1"
                        >
                            {isExpanded ? 'Show Less' : `+ ${template.exercises.length - 4} More`}
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="grid grid-cols-3 gap-2 pt-3 relative z-10 w-full">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(template);
                    }}
                    className="flex items-center justify-center gap-1.5 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold text-white transition-colors uppercase tracking-widest"
                >
                    <Edit2 className="w-3 h-3" />
                    Edit
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(template);
                    }}
                    className="flex items-center justify-center gap-1.5 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-[10px] font-bold transition-colors uppercase tracking-widest"
                >
                    <Trash2 className="w-3 h-3" />
                    Delete
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onStart(template);
                    }}
                    className="flex items-center justify-center gap-1.5 py-3 bg-primary hover:bg-primary/90 rounded-xl text-[10px] font-bold text-white shadow-lg shadow-primary/20 transition-all active:scale-95 uppercase tracking-widest"
                >
                    <Play className="w-3 h-3 fill-current" />
                    Start
                </button>
            </div>
        </div>
    );
};

export default TemplateCard;

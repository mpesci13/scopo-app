import React from 'react';
import { Folder, ChevronLeft, Plus } from 'lucide-react';

const LibraryView = ({ onBack, routines, onSelectFolder }) => {
    return (
        <div className="h-full flex flex-col animate-slide-in-right">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-white">My Library</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 auto-rows-fr">
                {routines.map(routine => (
                    <button
                        key={routine.id}
                        onClick={() => onSelectFolder(routine)}
                        className="flex flex-col justify-between p-5 bg-white/5 border border-white/10 rounded-[20px] hover:bg-white/10 hover:border-primary/30 transition-all group active:scale-[0.98] min-h-[140px]"
                    >
                        <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors w-fit">
                            <Folder className="w-6 h-6" />
                        </div>
                        <div className="text-left mt-4">
                            <h3 className="font-bold text-white text-lg leading-tight">{routine.name}</h3>
                            <p className="text-xs text-white/40 mt-1">{routine.templates.length} Workouts</p>
                        </div>
                    </button>
                ))}

                <button className="flex flex-col items-center justify-center p-5 border border-dashed border-white/20 rounded-[20px] text-white/40 hover:text-white hover:border-white/40 transition-colors min-h-[140px]">
                    <Plus className="w-6 h-6 mb-2" />
                    <span className="font-medium text-sm">Add Folder</span>
                </button>
            </div>
        </div>
    );
};

export default LibraryView;

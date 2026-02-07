import React from 'react';
import { Plus, FolderOpen, Play } from 'lucide-react';

const LoggerHub = ({ onStartEmpty, onBuildNew, onOpenLibrary }) => {
    return (
        <div className="flex flex-col gap-6 p-2 h-full">
            {/* Empty Slate - Prominent */}
            <button
                onClick={onStartEmpty}
                className="group relative flex flex-col justify-end p-6 min-h-[180px] rounded-[20px] bg-gradient-to-br from-[#002E5D]/20 to-[#0a0a0a] border border-primary/30 hover:border-primary/60 shadow-[0_0_30px_rgba(0,46,93,0.3)] transition-all active:scale-[0.98] overflow-hidden"
            >
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                <div className="absolute top-6 right-6 p-3 bg-primary/20 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Play className="w-6 h-6 fill-current" />
                </div>

                <div className="relative z-10 text-left">
                    <h3 className="text-2xl font-bold text-white mb-1">Start Empty Workout</h3>
                    <p className="text-sm text-white/60">Flash-log a session from scratch.</p>
                </div>
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Build New Template */}
                <button
                    onClick={onBuildNew}
                    className="flex flex-col justify-between p-6 min-h-[150px] rounded-[20px] bg-white/5 border border-white/10 hover:border-white/20 transition-all active:scale-[0.98] text-left"
                >
                    <div className="p-3 bg-white/5 w-fit rounded-xl mb-4">
                        <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Build Template</h3>
                        <p className="text-xs text-white/40 mt-1">Create a new routine.</p>
                    </div>
                </button>

                {/* My Library */}
                <button
                    onClick={onOpenLibrary}
                    className="flex flex-col justify-between p-6 min-h-[150px] rounded-[20px] bg-white/5 border border-white/10 hover:border-white/20 transition-all active:scale-[0.98] text-left"
                >
                    <div className="p-3 bg-white/5 w-fit rounded-xl mb-4">
                        <FolderOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">My Library</h3>
                        <p className="text-xs text-white/40 mt-1">Browse your playbook.</p>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default LoggerHub;

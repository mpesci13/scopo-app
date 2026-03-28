import React from 'react';
import { ArrowLeft, Target, Plus } from 'lucide-react';

const CHALLENGE_TEMPLATES = [
    {
        title: 'Winter Arc',
        durationType: 'days',
        durationValue: '30',
        rules: [
            { id: 't1_r1', name: '🏋️ Workout', type: 'daily_habit', isWorkoutRule: true },
            { id: 't1_r2', name: '💧 1 Gallon Water', type: 'daily_habit' },
            { id: 't1_r3', name: '🥗 Clean Eat', type: 'daily_habit' },
            { id: 't1_r4', name: '🍷 No Alcohol', type: 'daily_habit' }
        ]
    },
    {
        title: 'Sleep Week',
        durationType: 'days',
        durationValue: '7',
        rules: [
            { id: 't2_r1', name: '💤 8h Sleep', type: 'daily_habit' },
            { id: 't2_r2', name: '🚫 No Screens 1h before bed', type: 'daily_habit' },
            { id: 't2_r3', name: '📚 Read 10 Pages', type: 'daily_habit' }
        ]
    },
    {
        title: 'Base Camp',
        durationType: 'weeks',
        durationValue: '2',
        rules: [
            { id: 't3_r1', name: '🥾 10k Steps', type: 'daily_habit' },
            { id: 't3_r2', name: '💧 Drink 3L Water', type: 'daily_habit' }
        ]
    }
];

const TemplateSelectionFlow = ({ onBack, onSelectTemplate, onBuildCustom }) => {
    return (
        <div className="h-full flex flex-col bg-[#0a0a0a] text-white animate-fade-in relative z-50 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b border-white/5 sticky top-0 bg-[#0a0a0a] z-10">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 text-white/60 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold">Choose a Template</h2>
            </div>

            <div className="flex-1 p-4 flex flex-col pb-32">
                <p className="text-white/40 text-sm mb-6">Select a pre-built challenge schema to instantly populate your rules, or start from scratch.</p>

                {/* Templates Grid */}
                <div className="flex flex-col gap-4 mb-8">
                    {CHALLENGE_TEMPLATES.map((tpl, i) => (
                        <div 
                            key={i} 
                            onClick={() => onSelectTemplate(tpl)}
                            className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.98] group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{tpl.title}</h4>
                                <span className="bg-black/40 text-white/60 text-[10px] uppercase font-bold px-2 py-1 rounded-md border border-white/5">
                                    {tpl.durationValue} {tpl.durationType}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {tpl.rules.map(r => (
                                    <span key={r.id} className="text-[10px] font-semibold text-white/60 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                                        {r.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-[#0a0a0a] px-4 text-xs font-bold text-white/40 uppercase tracking-widest">Or</span>
                    </div>
                </div>

                <button
                    onClick={onBuildCustom}
                    className="mt-4 w-full py-4 bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/10 rounded-2xl flex items-center justify-center gap-3 transition-all group"
                >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-bold text-lg">Build Custom Challenge</span>
                </button>
            </div>
        </div>
    );
};

export default TemplateSelectionFlow;

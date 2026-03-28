import React, { useState } from 'react';
import { Target, Plus, Calendar as CalendarIcon, History } from 'lucide-react';
import { useChallenge } from '../../context/ChallengeContext';
import CreateChallengeFlow from './CreateChallengeFlow';
import ActiveChallengePanel from './ActiveChallengePanel';
import TemplateSelectionFlow from './TemplateSelectionFlow';
import ChallengeSummary from './ChallengeSummary';

const ChallengesTab = () => {
    // 'main', 'templates', 'create'
    const [viewMode, setViewMode] = useState('main');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [challengeToEdit, setChallengeToEdit] = useState(null);
    const [selectedPastChallenge, setSelectedPastChallenge] = useState(null);
    
    // Updated context
    const { activeChallenge, pastChallenges } = useChallenge();

    const handleStartCreateFlow = () => {
        setSelectedTemplate(null);
        setViewMode('create');
    };

    const handleTemplateSelected = (tpl) => {
        setSelectedTemplate(tpl);
        setViewMode('create');
    };

    const handleEditChallenge = (challenge) => {
        setChallengeToEdit(challenge);
        setViewMode('create');
    };

    if (viewMode === 'templates') {
        return (
            <div className="absolute inset-0 z-50 bg-[#0a0a0a]">
                <TemplateSelectionFlow
                    onBack={() => setViewMode('main')}
                    onSelectTemplate={handleTemplateSelected}
                    onBuildCustom={handleStartCreateFlow}
                />
            </div>
        );
    }

    if (viewMode === 'create') {
        return (
            <div className="absolute inset-0 z-50 bg-[#0a0a0a]">
                <CreateChallengeFlow 
                    initialTemplate={selectedTemplate}
                    challengeToEdit={challengeToEdit}
                    onBack={() => {
                        if (challengeToEdit) {
                            setViewMode('main');
                            setChallengeToEdit(null);
                        } else {
                            setViewMode('templates'); 
                            setSelectedTemplate(null); 
                        }
                    }} 
                    onComplete={() => { 
                        setViewMode('main'); 
                        setSelectedTemplate(null); 
                        setChallengeToEdit(null);
                    }} 
                />
            </div>
        );
    }

    if (selectedPastChallenge) {
        return (
            <div className="absolute inset-0 z-50 bg-[#0a0a0a]">
                <ChallengeSummary 
                    challenge={selectedPastChallenge}
                    onBack={() => setSelectedPastChallenge(null)}
                />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a] text-white animate-fade-in pb-24 relative overflow-y-auto w-full max-w-md mx-auto p-4">
            
            <div className="flex items-center justify-between mb-8 mt-4">
                <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Challenges</h1>
                {/* Only show + button if no active challenge, forcing them to finish/abandon current one first */}
                {!activeChallenge && (
                    <button 
                        onClick={() => setViewMode('templates')}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-white/10 text-primary"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* HERO SECTION: Active Challenge or Empty State */}
            {activeChallenge ? (
                <div className="mb-12">
                    <ActiveChallengePanel 
                        challenge={activeChallenge} 
                        onEdit={handleEditChallenge}
                    />
                </div>
            ) : (
                <div className="text-center bg-gradient-to-br from-white/5 to-transparent border border-white/5 rounded-3xl p-8 mb-12 flex flex-col items-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                        <Target className="w-8 h-8 text-primary/60" />
                    </div>
                    <h3 className="text-xl font-black italic tracking-tight text-white mb-2 uppercase">No Active Mission</h3>
                    <p className="text-white/40 text-sm mb-8 px-4 leading-relaxed">You are currently at base camp. Pick a new challenge to track your daily habits and forge consistency.</p>
                    <button
                        onClick={() => setViewMode('templates')}
                        className="w-full py-4 bg-primary text-white rounded-xl font-bold italic uppercase tracking-widest active:scale-95 transition-transform shadow-[0_0_20px_rgba(0,46,93,0.4)]"
                    >
                        Start Challenge
                    </button>
                </div>
            )}

            {/* HISTORY SECTION */}
            <div>
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <History className="w-3.5 h-3.5" />
                    Past Challenges
                </h3>
                
                {pastChallenges && pastChallenges.length > 0 ? (
                    <div className="space-y-3">
                        {pastChallenges.map(chal => {
                            const isAbandoned = chal.status === 'abandoned';
                            return (
                                <div 
                                    key={chal.id} 
                                    onClick={() => setSelectedPastChallenge(chal)}
                                    className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98]"
                                >
                                    <div>
                                        <h4 className={`font-bold text-sm ${isAbandoned ? 'text-white/40' : 'text-white'} group-hover:text-primary transition-colors`}>{chal.title}</h4>
                                        <p className="text-[10px] text-white/40 font-medium tracking-wider uppercase mt-1 flex items-center gap-1.5">
                                            <CalendarIcon className="w-3 h-3 text-white/20" />
                                            {new Date(chal.duration.startDate).toLocaleDateString()} - {new Date(chal.duration.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-1 text-[9px] uppercase font-bold tracking-widest rounded-md border ${
                                            isAbandoned 
                                            ? 'bg-red-500/10 text-red-500/80 border-red-500/20' 
                                            : 'bg-primary/20 text-primary border-primary/30'
                                        }`}>
                                            {isAbandoned ? 'Abandoned' : 'Completed'}
                                        </span>
                                        <Plus className="w-4 h-4 text-white/20 group-hover:text-white transition-colors rotate-45" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-black/40 rounded-2xl border border-white/5 text-white/20 text-xs font-medium">
                        Your challenge history will appear here.
                    </div>
                )}
            </div>

            {/* Dev Reset Utility */}
            <div className="mt-12 pt-8 border-t border-white/5 text-center">
                <button 
                    onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                    }}
                    className="text-[10px] font-bold text-white/10 hover:text-red-500/40 uppercase tracking-[0.2em] transition-colors p-4"
                >
                    Clear All App Data & Reset
                </button>
            </div>

        </div>
    );
};

export default ChallengesTab;

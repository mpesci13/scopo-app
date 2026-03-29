import React, { useState } from 'react';
import { User, Rocket, Check, ArrowRight, Loader2 } from 'lucide-react';

const EMOJIS = ['🦁', '🦅', '🦍', '🐺', '🦾', '🔥', '⚡️', '⚔️', '🛡️', '🛰️', '🏃‍♂️', '🏋️‍♀️'];

const OnboardingView = ({ onComplete, loading: parentLoading }) => {
    const [nickname, setNickname] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);
    const [step, setStep] = useState(1); // 1: Name, 2: Emoji

    const handleSubmit = () => {
        if (!nickname.trim()) return;
        if (step === 1) {
            setStep(2);
        } else {
            onComplete({ nickname: nickname.trim(), emoji: selectedEmoji });
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="w-full max-w-sm relative z-10">
                {/* Progress Indicators */}
                <div className="flex gap-2 mb-12 justify-center">
                    <div className={`h-1 rounded-full transition-all duration-500 ${step === 1 ? 'w-8 bg-primary' : 'w-4 bg-white/10'}`} />
                    <div className={`h-1 rounded-full transition-all duration-500 ${step === 2 ? 'w-8 bg-primary' : 'w-4 bg-white/10'}`} />
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2 leading-tight">
                        {step === 1 ? 'Welcome, Captain' : 'Select Your Sigil'}
                    </h1>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed">
                        {step === 1 
                            ? 'Identify yourself for the Squad protocols.' 
                            : 'Choose an icon to represent your performance.'}
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl transition-all duration-500">
                    {step === 1 ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-1">Squad Nickname</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                    <input 
                                        type="text"
                                        autoFocus
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        placeholder="Captain America"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-white text-base outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-4 gap-4 mb-8">
                                {EMOJIS.map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => setSelectedEmoji(emoji)}
                                        className={`w-full aspect-square text-2xl flex items-center justify-center rounded-2xl transition-all ${
                                            selectedEmoji === emoji 
                                                ? 'bg-primary border-primary scale-110 shadow-[0_0_20px_rgba(0,46,93,0.4)]' 
                                                : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                        }`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={handleSubmit}
                        disabled={step === 1 && !nickname.trim() || parentLoading}
                        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-30 text-white rounded-[1.5rem] py-5 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 mt-8"
                    >
                        {parentLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span>{step === 1 ? 'Next Phase' : 'Activate Identity'}</span>
                                {step === 1 ? <ArrowRight className="w-5 h-5" /> : <Rocket className="w-5 h-5" />}
                            </>
                        )}
                    </button>

                    {step === 2 && (
                        <button 
                            onClick={() => setStep(1)}
                            className="w-full mt-4 text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors"
                        >
                            Back To Name
                        </button>
                    )}
                </div>

                <p className="mt-8 text-center text-white/10 text-[9px] font-bold uppercase tracking-[0.3em] max-w-[240px] mx-auto leading-relaxed">
                    Identity verified on Scopo-Fit secure networks.
                </p>
            </div>
        </div>
    );
};

export default OnboardingView;

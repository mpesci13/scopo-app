import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, History as HistoryIcon, Home } from 'lucide-react';

const CelebrationModal = ({ onClose, onViewHistory }) => {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        setShowConfetti(true);
        // Simple confetti effect could be added here or via a library.
        // For now, we'll use CSS animations.
    }, []);

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-6">

            {/* Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse-slow"></div>
            </div>

            <div className="relative z-10 w-full max-w-sm bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center space-y-6 shadow-2xl transform scale-100 animate-scale-in">

                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle className="w-10 h-10 text-green-500 animate-bounce-short" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">
                        Workout Saved!
                    </h2>
                    <p className="text-white/60 text-sm leading-relaxed">
                        Excellent work. Your session details have been added to your history.
                    </p>
                </div>

                <div className="w-full space-y-3 pt-4">
                    <button
                        onClick={onViewHistory}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 group"
                    >
                        <HistoryIcon className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                        View History
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        Back to Dashboard
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CelebrationModal;

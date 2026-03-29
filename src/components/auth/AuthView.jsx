import React, { useState } from 'react';
import { auth } from '../../firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    updateProfile 
} from 'firebase/auth';
import { Dumbbell, Mail, Lock, User, ArrowRight, Loader2, Apple, Globe } from 'lucide-react';

const AuthView = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                if (displayName) {
                    await updateProfile(userCredential.user, { displayName });
                }
            }
        } catch (err) {
            console.error(err);
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo Section */}
                <div className="text-center mb-10 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-[2.5rem] border border-primary/30 mb-6 shadow-[0_0_30px_rgba(0,46,93,0.3)]">
                        <Dumbbell className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white mb-2 leading-none">
                        SCOPO
                    </h1>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
                        Your Mission Dashboard
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 shadow-2xl animate-slide-up">
                    <div className="flex gap-4 mb-8">
                        <button 
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 pb-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
                                isLogin ? 'text-primary border-primary' : 'text-white/20 border-transparent'
                            }`}
                        >
                            Sign In
                        </button>
                        <button 
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 pb-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
                                !isLogin ? 'text-primary border-primary' : 'text-white/20 border-transparent'
                            }`}
                        >
                            Register
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-1.5 px-1">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                    <input 
                                        type="text"
                                        required
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Captain America"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5 px-1">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                <input 
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="captain@scopo.fit"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 px-1 pb-2">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                <input 
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-500 text-xs font-bold text-center animate-shake">
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-[1.5rem] py-5 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 group overflow-hidden relative"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>{isLogin ? 'Enter The Dashboard' : 'Commence Training'}</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest text-center mb-4">Or Continue With</p>
                        <div className="flex gap-3">
                            <button className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 flex items-center justify-center hover:bg-white/10 transition-colors opacity-50 cursor-not-allowed">
                                <Apple className="w-5 h-5 text-white" />
                            </button>
                            <button className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 flex items-center justify-center hover:bg-white/10 transition-colors opacity-50 cursor-not-allowed">
                                <Globe className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-white/20 text-[10px] font-bold uppercase tracking-widest max-w-[280px] mx-auto leading-relaxed">
                    By entering SCOPO, you are committing to your training objectives and squad protocol.
                </p>
            </div>
        </div>
    );
};

export default AuthView;

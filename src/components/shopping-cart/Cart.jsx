import React, { useState } from 'react';
import { Trash2, GripVertical, Save, ChevronUp, ChevronDown } from 'lucide-react';
import { useWorkout } from '../../context/WorkoutContext';

const Cart = () => {
    const { cart, removeFromCart, reorderCart, saveTemplate, clearCart } = useWorkout();
    const [templateName, setTemplateName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        if (!templateName) return;
        saveTemplate(templateName);
        setTemplateName('');
        // clearCart(); // Optional: Clear cart after save? Or keep it to start workout? 
        // Let's keep it for now, user might want to edit it further? 
        // Requirement says "Save as Template", usually implies saving the structure.
        setIsSaving(false);
    };

    if (cart.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-white/30 p-8 text-center border-l border-white/10 bg-[#0a0a0a]/50">
                <p>Your cart is empty.</p>
                <p className="text-xs mt-2">Add exercises to build your routine.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] border-l border-white/10">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="font-semibold text-white">Your Routine <span className="text-primary text-sm ml-2">({cart.length})</span></h2>
                <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-300 transition-colors">Clear All</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg group animate-fade-in border border-white/5">
                        <div className="flex flex-col gap-1 text-white/20">
                            <button
                                onClick={() => index > 0 && reorderCart(index, index - 1)}
                                disabled={index === 0}
                                className="hover:text-white disabled:opacity-0 transition-colors"
                            >
                                <ChevronUp className="w-3 h-3" />
                            </button>
                            <GripVertical className="w-4 h-4 cursor-grab active:cursor-grabbing" />
                            <button
                                onClick={() => index < cart.length - 1 && reorderCart(index, index + 1)}
                                disabled={index === cart.length - 1}
                                className="hover:text-white disabled:opacity-0 transition-colors"
                            >
                                <ChevronDown className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-white/40">{item.category}</p>
                        </div>

                        <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Template Save Area */}
            <div className="p-4 border-t border-white/10 bg-[#0a0a0a]">
                {isSaving ? (
                    <div className="space-y-3 animate-fade-in">
                        <input
                            type="text"
                            placeholder="Routine Name (e.g. Leg Day)"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary outline-none"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsSaving(false)}
                                className="flex-1 py-2 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!templateName}
                                className="flex-1 py-2 rounded-lg text-xs font-medium bg-primary hover:bg-primary/90 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save Routine
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsSaving(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all border border-primary/20"
                    >
                        <Save className="w-4 h-4" />
                        Save as Template
                    </button>
                )}
            </div>
        </div>
    );
};

export default Cart;

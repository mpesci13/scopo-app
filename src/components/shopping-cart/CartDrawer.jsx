import React, { useState } from 'react';
import { X, Trash2, GripVertical, ChevronUp, ChevronDown, Save } from 'lucide-react';
import { useWorkout } from '../../context/WorkoutContext';

const CartDrawer = ({ isOpen, onClose }) => {
    const { cart, removeFromCart, reorderCart, saveTemplate, clearCart } = useWorkout();
    const [templateName, setTemplateName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        if (!templateName) return;
        saveTemplate(templateName);
        setTemplateName('');
        setIsSaving(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Drawer Content */}
            <div className="relative bg-[#111] border-t border-white/10 rounded-t-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-slide-up">
                {/* Drag Handle Area */}
                <div className="w-full flex justify-center py-3" onClick={onClose}>
                    <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                </div>

                {/* Header */}
                <div className="px-6 pb-4 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Current Routine</h2>
                        <p className="text-xs text-white/40">{cart.length} Exercises Selected</p>
                    </div>
                    <button
                        onClick={clearCart}
                        className="text-red-400 text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5"
                    >
                        Clear
                    </button>
                    {/* <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white">
                        <X className="w-5 h-5" />
                    </button> */}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
                    {cart.length === 0 ? (
                        <div className="h-40 flex items-center justify-center text-white/30 text-center">
                            Tap + on exercises<br />to build your routine
                        </div>
                    ) : (
                        cart.map((item, index) => (
                            <div key={item.id} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex flex-col gap-2 text-white/20">
                                    <button
                                        onClick={() => index > 0 && reorderCart(index, index - 1)}
                                        disabled={index === 0}
                                        className="p-1 hover:text-primary disabled:opacity-0"
                                    >
                                        <ChevronUp className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => index < cart.length - 1 && reorderCart(index, index + 1)}
                                        disabled={index === cart.length - 1}
                                        className="p-1 hover:text-primary disabled:opacity-0"
                                    >
                                        <ChevronDown className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex-1">
                                    <p className="font-semibold text-white text-base">{item.name}</p>
                                    <p className="text-sm text-white/40">{item.category}</p>
                                </div>

                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-3 text-white/30 hover:text-red-400"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/10 bg-[#111] pb-safe">
                    {isSaving ? (
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Routine Name"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:border-primary outline-none"
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsSaving(false)}
                                    className="flex-1 h-12 rounded-xl font-medium bg-white/10 text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!templateName}
                                    className="flex-1 h-12 rounded-xl font-medium bg-primary text-white disabled:opacity-50"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        itemCount > 0 && (
                            <button
                                onClick={() => setIsSaving(true)}
                                className="w-full h-12 flex items-center justify-center gap-2 rounded-xl font-semibold bg-primary text-white shadow-lg active:scale-[0.98] transition-all"
                            >
                                <Save className="w-5 h-5" />
                                Save as Template
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartDrawer;

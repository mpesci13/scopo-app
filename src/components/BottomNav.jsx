import React from 'react';
import { Home, Dumbbell, CalendarClock } from 'lucide-react';

const BottomNav = ({ activeTab, onTabChange }) => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/90 backdrop-blur-lg border-t border-white/10 z-50 pb-safe">
            <div className="flex justify-around items-center h-16">
                <NavButton
                    icon={Home}
                    label="Dashboard"
                    isActive={activeTab === 'dashboard'}
                    onClick={() => onTabChange('dashboard')}
                />
                <NavButton
                    icon={Dumbbell}
                    label="Logger"
                    isActive={activeTab === 'logger'}
                    onClick={() => onTabChange('logger')}
                />
                <NavButton
                    icon={CalendarClock}
                    label="History"
                    isActive={activeTab === 'history'}
                    onClick={() => onTabChange('history')}
                />
            </div>
        </nav>
    );
};

const NavButton = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary' : 'text-white/40 hover:text-white/60'
            }`}
    >
        <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);

export default BottomNav;

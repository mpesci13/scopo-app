import React, { useState } from 'react';
import BottomNav from './BottomNav';
import MobileHeader from './MobileHeader';

const Layout = ({ children, activeTab, onTabChange }) => {
    return (
        <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white font-sans">
            <MobileHeader />

            {/* Main Content Area - padded for header and bottom nav */}
            <main className="flex-1 w-full pb-24 overflow-y-auto">
                <div className="w-full max-w-md mx-auto p-4 animate-fade-in">
                    {children}
                </div>
            </main>

            <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
        </div>
    );
};

export default Layout;

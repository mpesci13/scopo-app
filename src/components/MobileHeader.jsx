import React from 'react';

const MobileHeader = () => {
    return (
        <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5 px-4 h-14 flex items-center justify-center">
            <h1 className="text-xl font-black tracking-tighter text-primary drop-shadow-[0_2px_10px_rgba(0,46,93,0.3)]">
                SCOPO
            </h1>
        </header>
    );
};

export default MobileHeader;

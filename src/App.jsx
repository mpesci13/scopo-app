import React, { useState } from 'react';
import { ClipboardList, ChevronLeft, Folder, Plus, Dumbbell } from 'lucide-react';
import Layout from './components/Layout';
import QuickLog from './components/QuickLog';
import ExerciseDirectory from './components/ExerciseDirectory';
import CartDrawer from './components/shopping-cart/CartDrawer';
import LoggerHub from './components/LoggerHub';
import ActiveSession from './components/active-session/ActiveSession';
import LibraryView from './components/library/LibraryView';
import FolderDetailView from './components/library/FolderDetailView';
import { WorkoutProvider, useWorkout } from './context/WorkoutContext';

const Dashboard = () => (
  <div className="flex items-center justify-center h-64 text-white/40">
    <p>Dashboard Coming Soon</p>
  </div>
);

const History = () => (
  <div className="flex items-center justify-center h-64 text-white/40">
    <p>History Coming Soon</p>
  </div>
);

const Logger = ({ openCart }) => {
  const [view, setView] = useState('hub'); // hub | directory | library | session | folder
  const [activeFolder, setActiveFolder] = useState(null);
  const { routines, clearCart, addToCart } = useWorkout();

  // Injection Logic
  const handleStartTemplate = (template) => {
    clearCart();
    template.exercises.forEach(ex => addToCart(ex));
    setView('session');
  };

  // Directory is now a sub-view invoked by Session or Build
  if (view === 'directory') {
    return (
      <div className="h-full flex flex-col animate-fade-in pb-20"> {/* Added pb-20 for tray space */}
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => setView('session')} className="p-2 -ml-2 text-white/60 hover:text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold text-white">Select Exercise</h2>
        </div>
        <div className="flex-1 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex flex-col">
          <ExerciseDirectory onFinishSelection={() => setView('session')} />
        </div>
      </div>
    );
  }

  if (view === 'library') {
    return (
      <LibraryView
        routines={routines}
        onBack={() => setView('hub')}
        onSelectFolder={(folder) => {
          setActiveFolder(folder);
          setView('folder');
        }}
      />
    );
  }

  if (view === 'folder' && activeFolder) {
    return (
      <FolderDetailView
        folder={activeFolder}
        onBack={() => setView('library')}
        onStartTemplate={handleStartTemplate}
      />
    );
  }

  if (view === 'session') {
    return (
      <ActiveSession
        onBack={() => setView('hub')}
        onAddExercise={() => setView('directory')}
      />
    );
  }

  return (
    <LoggerHub
      onStartEmpty={() => {
        clearCart();
        setView('directory'); // Go straight to directory
      }}
      onBuildNew={() => {
        clearCart();
        setView('directory');
      }}
      onOpenLibrary={() => setView('library')}
    />
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('logger'); // Default to Logger
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <WorkoutProvider>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'logger' && <Logger openCart={() => setIsCartOpen(true)} />}
        {activeTab === 'history' && <History />}

        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </Layout>
    </WorkoutProvider>
  );
}

export default App;

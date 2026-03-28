import React, { useState } from 'react';
import { ClipboardList, ChevronLeft, Folder, Plus, Dumbbell } from 'lucide-react';
import Layout from './components/Layout';
import QuickLog from './components/QuickLog';
import ExerciseDirectory from './components/ExerciseDirectory';
import CartDrawer from './components/shopping-cart/CartDrawer';
import LoggerHub from './components/LoggerHub';
import ActiveSession from './components/active-session/ActiveSession';
import WorkoutSuccess from './components/active-session/WorkoutSuccess';
import LibraryView from './components/library/LibraryView';
import FolderDetailView from './components/library/FolderDetailView';
import TemplateBuilder from './components/library/TemplateBuilder';
import History from './components/History';
import { WorkoutProvider, useWorkout } from './context/WorkoutContext';
import { ChallengeProvider, useChallenge } from './context/ChallengeContext';

import Dashboard from './components/Dashboard';
import ChallengesTab from './components/challenges/ChallengesTab';

const Logger = ({ openCart, onTabChange, initialAction }) => {
  const [view, setView] = useState(initialAction === 'empty' ? 'directory' : 'hub'); // hub | directory | library | session | folder
  const [activeFolder, setActiveFolder] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [directorySource, setDirectorySource] = useState('hub'); // 'hub' | 'session'
  const [sessionSource, setSessionSource] = useState('hub'); // 'hub' | 'folder'
  const [sessionStats, setSessionStats] = useState(null);
  const [completedSessionData, setCompletedSessionData] = useState(null);
  const { routines, clearCart, completeWorkout, addToCart, loadTemplate } = useWorkout();
  const { linkWorkoutToChallenge } = useChallenge();

  React.useEffect(() => {
    if (initialAction === 'empty') {
      clearCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAction]);

  const handleStartTemplate = (template) => {
    loadTemplate(template.exercises);
    setDirectorySource('session');
    setSessionSource('folder');
    setView('session');
  };

  const handleFinishSession = (stats, data) => {
    setSessionStats(stats);
    setCompletedSessionData(data);
    setView('success');
  };

  const handleCompleteLog = (rpe, notes, selectedChallengeIds = []) => {
    console.log('handleCompleteLog called', { completedSessionData, sessionStats, rpe, notes, selectedChallengeIds });
    if (completedSessionData && sessionStats) {
      const newSession = completeWorkout(completedSessionData, sessionStats, rpe, notes);
      
      // Link to selected challenges
      if (selectedChallengeIds.length > 0 && newSession) {
        selectedChallengeIds.forEach(challengeId => {
            linkWorkoutToChallenge(newSession.id, challengeId, completedSessionData, sessionStats);
        });
      }
    } else {
      console.error('Missing session data in handleCompleteLog');
    }
    // Do NOT clear cart or set view here. Wait for modal exit.
  };

  const handleExitSuccess = (destination = 'hub') => {
    clearCart();
    setSessionStats(null);
    setCompletedSessionData(null);
    if (destination === 'history') {
      onTabChange('history');
      setView('hub'); // Reset view for next time
    } else {
      onTabChange('dashboard'); // User requested "Home Page" which is Dashboard tab
      setView('hub');
    }
  };

  // Directory is now a sub-view invoked by Session or Build
  if (view === 'directory') {
    return (
      <div className="h-full flex flex-col animate-fade-in pb-20"> {/* Added pb-20 for tray space */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setView(directorySource === 'session' ? 'session' : directorySource === 'builder' ? 'builder' : 'hub')}
            className="p-2 -ml-2 text-white/60 hover:text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold text-white">Select Exercise</h2>
        </div>
        <div className="flex-1 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex flex-col">
          <ExerciseDirectory 
            isBuilderMode={directorySource === 'builder'}
            onFinishSelection={() => setView(directorySource === 'builder' ? 'builder' : 'session')} 
          />
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
        onStartTemplate={(template) => {
          const folder = routines.find(r => r.templates.some(t => t.id === template.id));
          setActiveFolder(folder); // Optional context setting
          handleStartTemplate(template);
        }}
        onEditTemplate={(template) => {
          const folder = routines.find(r => r.templates.some(t => t.id === template.id));
          setActiveFolder(folder); // Optional context setting
          loadTemplate(template.exercises);
          setEditingTemplate({ ...template, folderId: folder.id });
          setView('builder');
        }}
      />
    );
  }

  if (view === 'folder' && activeFolder) {
    const currentFolder = routines.find(r => r.id === activeFolder.id) || activeFolder;
    return (
      <FolderDetailView
        folder={currentFolder}
        onBack={() => setView('library')}
        onStartTemplate={handleStartTemplate}
        onEditTemplate={(template) => {
          loadTemplate(template.exercises);
          setEditingTemplate({ ...template, folderId: currentFolder.id });
          setView('builder');
        }}
      />
    );
  }

  if (view === 'builder') {
    return (
      <TemplateBuilder
        initialTemplate={editingTemplate}
        onBack={() => {
          setEditingTemplate(null);
          setView(editingTemplate ? 'folder' : 'hub');
        }}
        onAddExercise={() => {
          setDirectorySource('builder');
          setView('directory');
        }}
        onSaveComplete={(folderId) => {
          setEditingTemplate(null);
          if (folderId) {
            const folder = routines.find(r => r.id === folderId);
            if (folder) {
                setActiveFolder(folder);
                setView('folder');
                return;
            }
          }
          setView('library');
        }}
      />
    );
  }

  if (view === 'session') {
    return (
      <ActiveSession
        onBack={() => setView(sessionSource === 'folder' ? 'folder' : 'hub')}
        onAddExercise={() => {
          setDirectorySource('session');
          setView('directory');
        }}
        onFinishSession={handleFinishSession}
      />
    );
  }

  if (view === 'success' && sessionStats) {
    return (
      <WorkoutSuccess
        stats={sessionStats}
        onCompleteLog={handleCompleteLog}
        onClose={() => handleExitSuccess('hub')}
        onViewHistory={() => handleExitSuccess('history')}
      />
    );
  }

  return (
    <LoggerHub
      onStartEmpty={() => {
        clearCart();
        setDirectorySource('hub');
        setSessionSource('hub');
        setView('directory');
      }}
      onBuildNew={() => {
        clearCart();
        setEditingTemplate(null);
        setView('builder');
      }}
      onOpenLibrary={() => setView('library')}
    />
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // Default to Dashboard
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loggerInitialAction, setLoggerInitialAction] = useState(null);

  const handleTabChange = (tab) => {
    if (tab === 'logger') setLoggerInitialAction(null);
    setActiveTab(tab);
  };

  return (
    <ChallengeProvider>
      <WorkoutProvider>
        <Layout activeTab={activeTab} onTabChange={handleTabChange}>
          {activeTab === 'dashboard' && <Dashboard onStartWorkout={() => {
            setLoggerInitialAction('empty');
            setActiveTab('logger');
          }} />}
          {activeTab === 'challenges' && <ChallengesTab />}
          {activeTab === 'logger' && <Logger openCart={() => setIsCartOpen(true)} onTabChange={setActiveTab} initialAction={loggerInitialAction} />}
          {activeTab === 'history' && <History />}

          <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </Layout>
      </WorkoutProvider>
    </ChallengeProvider>
  );
}

export default App;

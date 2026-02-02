import { useState, useEffect } from 'react';
import { WorkoutProvider, useWorkout } from './context/WorkoutContext';
import SearchBar from './components/SearchBar';
import CategoryChips from './components/CategoryChips';
import ExerciseList from './components/ExerciseList';
import FloatingActionBar from './components/FloatingActionBar';
import WorkoutSession from './components/WorkoutSession';
import WorkoutSummary from './components/WorkoutSummary';
import RestTimer from './components/RestTimer';
import CartDrawer from './components/CartDrawer';
import Dashboard from './components/Dashboard';
import TemplatePreview from './components/TemplatePreview';
import { ChevronLeft, Plus } from 'lucide-react';

function WorkoutLogger() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [view, setView] = useState('dashboard'); // dashboard | selection | folder | preview | session | summary
  const [lastSessionData, setLastSessionData] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // For Folder/Template Navigation
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const { templates, folders, createFolder, deleteTemplate, session } = useWorkout();

  // Check for active session on mount
  useEffect(() => {
    if (session && view === 'dashboard') {
      // Keep on dashboard, but Resume button will show.
      // Or auto-redirect? User request said 'show Resume button prominently'.
    }
  }, [session]);

  if (view === 'session') {
    return (
      <>
        <RestTimer />
        <WorkoutSession
          onBack={() => setView('dashboard')}
          onFinish={(data) => {
            setLastSessionData(data);
            setView('summary');
          }}
        />
      </>
    );
  }

  if (view === 'summary') {
    return <WorkoutSummary session={lastSessionData} onHome={() => setView('dashboard')} />;
  }

  if (view === 'preview' && selectedTemplate) {
    return (
      <div className="container">
        <TemplatePreview
          template={selectedTemplate}
          onBack={() => {
            setSelectedTemplate(null);
            setView(activeFolderId !== undefined ? 'folder' : 'dashboard');
          }}
          onStart={() => setView('session')}
        />
      </div>
    );
  }

  // Header logic based on view
  const renderHeader = () => {
    if (view === 'folder') {
      const folderName = activeFolderId ? folders.find(f => f.id === activeFolderId)?.name : 'All Templates';
      return (
        <header style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={() => setView('dashboard')} style={{ padding: '0.5rem', marginLeft: '-0.5rem', color: 'hsl(var(--color-primary))' }}>
            <ChevronLeft />
          </button>
          <h1 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold' }}>{folderName}</h1>
        </header>
      );
    }
    if (view === 'selection') {
      return (
        <header style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={() => setView('dashboard')} style={{ padding: '0.5rem', marginLeft: '-0.5rem', color: 'hsl(var(--color-primary))' }}>
            <ChevronLeft />
          </button>
          <h1 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold' }}>Select Exercises</h1>
        </header>
      );
    }
    return (
      <header style={{ marginBottom: 'var(--space-lg)' }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)' }}>
          Workout Logger
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-xs)' }}>
          Welcome back
        </p>
      </header>
    );
  };

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      {renderHeader()}

      {view === 'dashboard' && (
        <>
          <Dashboard
            onStartEmpty={() => setView('selection')}
            onResume={() => setView('session')}
            onSelectFolder={(folderId) => {
              setActiveFolderId(folderId);
              setView('folder');
            }}
          />

          <button
            onClick={() => {
              if (confirm('Create fresh start? This deletes all data.')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            style={{
              marginTop: '2rem',
              width: '100%',
              padding: '1rem',
              backgroundColor: 'transparent',
              color: 'hsl(var(--color-text-muted))',
              fontSize: '0.8rem',
              border: '1px dashed var(--color-border)',
              opacity: 0.6
            }}
          >
            Reset App Data (Testing)
          </button>
        </>
      )}

      {view === 'folder' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Render Templates in this folder */}
          {templates
            .filter(t => activeFolderId === null || t.folderId === activeFolderId)
            .length === 0 ? (
            <p style={{ color: 'hsl(var(--color-text-muted))', textAlign: 'center', marginTop: '2rem' }}>
              No templates here yet.
            </p>
          ) : null
          }

          {templates
            .filter(t => activeFolderId === null || t.folderId === activeFolderId)
            .map(template => (
              <div
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template);
                  setView('preview');
                }}
                style={{
                  backgroundColor: 'hsl(var(--color-surface))',
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  border: '1px solid var(--color-border)'
                }}
              >
                <h3 style={{ fontWeight: 'bold' }}>{template.name}</h3>
                <p style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.9rem' }}>
                  {template.exercises.length} exercises
                </p>
              </div>
            ))}
        </div>
      )}

      {view === 'selection' && (
        <>
          <SearchBar value={search} onSearch={setSearch} />
          <CategoryChips activeCategory={category} onSelectCategory={setCategory} />
          <ExerciseList filter={search} category={category} />
          <FloatingActionBar
            onStart={() => setView('session')}
            onViewCart={() => setIsCartOpen(true)}
          />
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            onStart={() => setView('session')}
          />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <WorkoutProvider>
      <WorkoutLogger />
    </WorkoutProvider>
  );
}

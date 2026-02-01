import { useState } from 'react';
import { WorkoutProvider, useWorkout } from './context/WorkoutContext';
import SearchBar from './components/SearchBar';
import CategoryChips from './components/CategoryChips';
import ExerciseList from './components/ExerciseList';
import FloatingActionBar from './components/FloatingActionBar';
import WorkoutSession from './components/WorkoutSession';
import WorkoutSummary from './components/WorkoutSummary';
import RestTimer from './components/RestTimer';
import CartDrawer from './components/CartDrawer';

function WorkoutLogger() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [view, setView] = useState('selection'); // selection | session | summary
  const [lastSessionData, setLastSessionData] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('exercises'); // exercises | templates
  const { templates, startSession, deleteTemplate } = useWorkout();

  if (view === 'session') {
    return (
      <>
        <RestTimer />
        <WorkoutSession
          onBack={() => setView('selection')}
          onFinish={(data) => {
            setLastSessionData(data);
            setView('summary');
          }}
        />
      </>
    );
  }

  if (view === 'summary') {
    return <WorkoutSummary session={lastSessionData} onHome={() => setView('selection')} />;
  }

  return (
    <div className="container">
      <header style={{ marginBottom: 'var(--space-lg)' }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)' }}>
          Workout Logger
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-xs)' }}>
          Select exercises to start
        </p>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: 'var(--space-md)', borderBottom: '1px solid var(--color-border)' }}>
        <button
          onClick={() => setActiveTab('exercises')}
          style={{
            padding: '0.5rem 1rem',
            borderBottom: activeTab === 'exercises' ? '2px solid hsl(var(--color-primary))' : '2px solid transparent',
            color: activeTab === 'exercises' ? 'hsl(var(--color-primary))' : 'hsl(var(--color-text-muted))',
            fontWeight: 'bold',
            transition: 'all 0.2s',
          }}
        >
          Exercises
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          style={{
            padding: '0.5rem 1rem',
            borderBottom: activeTab === 'templates' ? '2px solid hsl(var(--color-primary))' : '2px solid transparent',
            color: activeTab === 'templates' ? 'hsl(var(--color-primary))' : 'hsl(var(--color-text-muted))',
            fontWeight: 'bold',
            transition: 'all 0.2s',
          }}
        >
          Templates
        </button>
      </div>

      {activeTab === 'exercises' ? (
        <>
          <SearchBar value={search} onSearch={setSearch} />
          <CategoryChips activeCategory={category} onSelectCategory={setCategory} />
          <ExerciseList filter={search} category={category} />
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {templates.length === 0 && (
            <p style={{ color: 'hsl(var(--color-text-muted))', textAlign: 'center', marginTop: '2rem' }}>
              No templates saved yet. Finish a workout to save one!
            </p>
          )}
          {templates.map(template => (
            <div key={template.id} style={{
              backgroundColor: 'hsl(var(--color-surface))',
              padding: '1rem',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontWeight: 'bold' }}>{template.name}</h3>
                <button
                  onClick={() => {
                    if (confirm('Delete template?')) deleteTemplate(template.id);
                  }}
                  style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.8rem' }}
                >
                  Delete
                </button>
              </div>
              <p style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.9rem' }}>
                {template.exercises.length} exercises
              </p>
              <button
                onClick={() => {
                  startSession(template.exercises);
                  setView('session');
                }}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: 'hsl(var(--color-primary))',
                  color: 'white',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 'bold'
                }}
              >
                Start Workout
              </button>
            </div>
          ))}
        </div>
      )}

      <FloatingActionBar
        onStart={() => setView('session')}
        onViewCart={() => setIsCartOpen(true)}
      />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onStart={() => setView('session')}
      />
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

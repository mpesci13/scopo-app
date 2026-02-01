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

      <SearchBar onSearch={setSearch} />
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

import { useState } from 'react';
import { WorkoutProvider } from './context/WorkoutContext';
import SearchBar from './components/SearchBar';
import CategoryChips from './components/CategoryChips';
import ExerciseList from './components/ExerciseList';
import FloatingActionBar from './components/FloatingActionBar';
import WorkoutSession from './components/WorkoutSession';

function WorkoutLogger() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [view, setView] = useState('selection'); // selection | session

  if (view === 'session') {
    return <WorkoutSession onBack={() => setView('selection')} />;
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
      <FloatingActionBar onStart={() => setView('session')} />
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

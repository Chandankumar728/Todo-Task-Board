import React from 'react';
import { TaskBoardProvider } from './context/TaskBoardContext';
import TaskBoard from './components/TaskBoard';

function App() {
  return (
    <TaskBoardProvider>
      <TaskBoard />
    </TaskBoardProvider>
  );
}

export default App;
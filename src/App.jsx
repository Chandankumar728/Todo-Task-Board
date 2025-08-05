import { TaskBoardProvider } from './context/TaskBoardContext';
import Task from './page/tasks';

function App() {
  return (
    <TaskBoardProvider>
      <Task />
    </TaskBoardProvider>
  );
}

export default App;
import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus, Users } from 'lucide-react';
import Column from './Column';
import Task from './Task';
import { useTaskBoard } from '../context/TaskBoardContext';
import { addColumn, updateColumn, updateTask } from '../firebase/taskService';

const TaskBoard = () => {
  const { state } = useTaskBoard();
  const [activeTask, setActiveTask] = useState(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;

    try {
      await addColumn(newColumnTitle);
      setNewColumnTitle('');
      setIsAddingColumn(false);
    } catch (error) {
      console.error('Error adding column:', error);
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const task = state.tasks.find(task => task.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTask = state.tasks.find(task => task.id === active.id);
    const overColumn = state.columns.find(col => col.id === over.id);

    if (!activeTask || !overColumn) return;

    
    if (activeTask.columnId !== overColumn.id) {
      try {
       
        await updateTask(activeTask.id, { columnId: overColumn.id });

        
        const oldColumn = state.columns.find(col => col.id === activeTask.columnId);
        if (oldColumn) {
          const newTaskIds = oldColumn.taskIds.filter(id => id !== activeTask.id);
          await updateColumn(oldColumn.id, { taskIds: newTaskIds });
        }

        
        const newTaskIds = [...(overColumn.taskIds || []), activeTask.id];
        await updateColumn(overColumn.id, { taskIds: newTaskIds });
      } catch (error) {
        console.error('Error moving task:', error);
      }
    }
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">Error: {state.error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
          <div className="flex items-center gap-4">
            {/* <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users size={16} />
              <span>{state.onlineUsers} online</span>
            </div> */}
          </div>
        </div>
      </div>

     
      <div className="p-6 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 min-w-max">
            {state.columns.map((column) => (
              <Column key={column.id} column={column} />
            ))}

            
            <div className="w-80 flex-shrink-0">
              {isAddingColumn ? (
                <div className="bg-gray-100 rounded-lg p-4">
                  <input
                    type="text"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    placeholder="Column title"
                    className="w-full px-3 py-2 border border-gray-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={(e) => e.key === 'Enter' && handleAddColumn()}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddColumn}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      Add Column
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingColumn(false);
                        setNewColumnTitle('');
                      }}
                      className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingColumn(true)}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 flex items-center justify-center gap-2 min-h-[200px]"
                >
                  <Plus size={20} />
                  Add Column
                </button>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 rotate-3">
                <h3 className="font-medium text-gray-900 text-sm">{activeTask.title}</h3>
                {activeTask.description && (
                  <p className="text-gray-600 text-xs mt-1">{activeTask.description}</p>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default TaskBoard;
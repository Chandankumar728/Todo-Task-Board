import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import Task from './Task';
import { addTask, updateColumn, deleteColumn } from '../firebase/taskService';
import { useTaskBoard } from '../context/TaskBoardContext';

const Column = ({ column }) => {
  const { state } = useTaskBoard();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [columnTitle, setColumnTitle] = useState(column.title);

  const { setNodeRef } = useDroppable({
    id: column.id,
  });


  const columnTasks = state.tasks.filter(task => task.columnId === column.id);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      await addTask(column.id, newTaskTitle, newTaskDescription);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setIsAddingTask(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateColumn = async () => {
    if (!columnTitle.trim()) return;

    try {
      await updateColumn(column.id, { title: columnTitle });
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Error updating column:', error);
    }
  };

  const handleDeleteColumn = async () => {
    try {
      await deleteColumn(column.id);
    } catch (error) {
      console.error('Error deleting column:', error);
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg p-4 w-80 flex-shrink-0">
     
      <div className="flex items-center justify-between mb-4">
        {isEditingTitle ? (
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={columnTitle}
              onChange={(e) => setColumnTitle(e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={(e) => e.key === 'Enter' && handleUpdateColumn()}
            />
            <button
              onClick={handleUpdateColumn}
              className="p-1 text-green-600 hover:text-green-700"
            >
              <Save size={16} />
            </button>
            <button
              onClick={() => {
                setColumnTitle(column.title);
                setIsEditingTitle(false);
              }}
              className="p-1 text-gray-600 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-800">{column.title}</h2>
              <span className="bg-gray-300 text-gray-600 text-xs px-2 py-1 rounded-full">
                {columnTasks.length}
              </span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setIsEditingTitle(true)}
                className="p-1 text-gray-400 hover:text-blue-500 rounded"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={handleDeleteColumn}
                className="p-1 text-gray-400 hover:text-red-500 rounded"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </>
        )}
      </div>

      
      <div
        ref={setNodeRef}
        className="min-h-[200px] space-y-2"
      >
        <SortableContext items={columnTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {columnTasks.map((task) => (
            <div key={task.id} className="group">
              <Task task={task} columnId={column.id} />
            </div>
          ))}
        </SortableContext>
      </div>

      
      {isAddingTask ? (
        <div className="mt-4 space-y-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Task title"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            placeholder="Task description (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="2"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddTask}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Add Task
            </button>
            <button
              onClick={() => {
                setIsAddingTask(false);
                setNewTaskTitle('');
                setNewTaskDescription('');
              }}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingTask(true)}
          className="w-full mt-4 p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Add Task
        </button>
      )}
    </div>
  );
};

export default Column;
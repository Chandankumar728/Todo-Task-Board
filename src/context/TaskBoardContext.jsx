import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { subscribeToColumns, subscribeToTasks } from '../firebase/taskService';

const TaskBoardContext = createContext();

const initialState = {
  columns: [],
  tasks: [],
  loading: true,
  error: null,
  onlineUsers: 0
};

const taskBoardReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_COLUMNS':
      return { ...state, columns: action.payload };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'SET_ONLINE_USERS':
      return { ...state, onlineUsers: action.payload };
    default:
      return state;
  }
};

export const TaskBoardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskBoardReducer, initialState);

  useEffect(() => {
    let unsubscribeColumns, unsubscribeTasks;

    const setupSubscriptions = async () => {
      try {
       
        unsubscribeColumns = subscribeToColumns((snapshot) => {
          const columns = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          dispatch({ type: 'SET_COLUMNS', payload: columns });
        });

       
        unsubscribeTasks = subscribeToTasks((snapshot) => {
          const tasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          dispatch({ type: 'SET_TASKS', payload: tasks });
        });

        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    setupSubscriptions();

    return () => {
      if (unsubscribeColumns) unsubscribeColumns();
      if (unsubscribeTasks) unsubscribeTasks();
    };
  }, []);

  return (
    <TaskBoardContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskBoardContext.Provider>
  );
};

export const useTaskBoard = () => { 
    
  const context = useContext(TaskBoardContext);
  if (!context) {
    throw new Error('useTaskBoard must be used within a TaskBoardProvider');
  }
  return context;
};
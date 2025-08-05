import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  getDoc
} from 'firebase/firestore';
import { db } from './config';

export const COLLECTIONS = {
  COLUMNS: 'columns',
  TASKS: 'tasks',
  PRESENCE: 'presence'
};


export const addColumn = async (title) => {
  return await addDoc(collection(db, COLLECTIONS.COLUMNS), {
    title,
    taskIds: [],
    createdAt: serverTimestamp(),
    order: Date.now()
  });
};

export const updateColumn = async (columnId, updates) => {
  const columnRef = doc(db, COLLECTIONS.COLUMNS, columnId);
  return await updateDoc(columnRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteColumn = async (columnId) => {
  const columnRef = doc(db, COLLECTIONS.COLUMNS, columnId);
  return await deleteDoc(columnRef);
};


export const addTask = async (columnId, title, description = '') => {
  try {
  
    const taskDoc = await addDoc(collection(db, COLLECTIONS.TASKS), {
      title,
      description,
      columnId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    
    const columnRef = doc(db, COLLECTIONS.COLUMNS, columnId);
    const columnSnap = await getDoc(columnRef);
    
    if (columnSnap.exists()) {
      const currentTaskIds = columnSnap.data().taskIds || [];
      await updateDoc(columnRef, {
        taskIds: [...currentTaskIds, taskDoc.id],
        updatedAt: serverTimestamp()
      });
    }

    return taskDoc;
  } catch (error) {
    console.error('Error in addTask:', error);
    throw error;
  }
};

export const updateTask = async (taskId, updates) => {
  const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
  return await updateDoc(taskRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteTask = async (taskId, columnId) => {
  try {
    
    const columnRef = doc(db, COLLECTIONS.COLUMNS, columnId);
    const columnSnap = await getDoc(columnRef);
    
    if (columnSnap.exists()) {
      const currentTaskIds = columnSnap.data().taskIds || [];
      await updateDoc(columnRef, {
        taskIds: currentTaskIds.filter(id => id !== taskId),
        updatedAt: serverTimestamp()
      });
    }

  
    const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error('Error in deleteTask:', error);
    throw error;
  }
};


export const subscribeToColumns = (callback) => {
  const q = query(collection(db, COLLECTIONS.COLUMNS), orderBy('order'));
  return onSnapshot(q, callback);
};

export const subscribeToTasks = (callback) => {
  return onSnapshot(collection(db, COLLECTIONS.TASKS), callback);
};
import React, { useContext } from 'react';
import './styles.css';
import TaskContext from '../TaskList/context';

export default function Task({ task }) {
  const { handleStatus, deleteTask } = useContext(TaskContext);
  const statusClass = task.closed ? 'active' : ''; // Tentukan class berdasarkan status task

  return (
    <div className="Task">
      <div className="task-content">{task.title}</div>
      <div className="task-actions">
        <span
          className={`status-button ${statusClass}`} // Tambahkan class status secara dinamis
          onClick={() => handleStatus(task)}
        >
          {task.closed ? 'Done' : 'On Progress'}
        </span>
        <button className="delete-button" onClick={() => deleteTask(task.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}
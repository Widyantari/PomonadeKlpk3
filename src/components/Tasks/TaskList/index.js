import React, { memo, useState, useEffect, useCallback } from 'react';
import produce from 'immer';
import TaskContext from './context';
import Task from '../Task';
import TypeSelect from '../../TypeSelect';

import './styles.css';

const TaskList = ({ selectedTaskType }) => {
  const [input, setInput] = useState('');
  const taskStatus = [
    { name: 'All', value: -1 },
    { name: 'On Progress', value: false },
    { name: 'Done', value: true }
  ];

  const [tasks, setTasks] = useState(
    JSON.parse(window.localStorage.getItem('pomodoro-react-tasks')) || []
  );
  const [selectedStatus, setSelectedStatus] = useState(taskStatus[0]);

  useEffect(() => {
    window.localStorage.setItem('pomodoro-react-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const move = useCallback((from, to) => {
    setTasks(
      produce(tasks, draft => {
        const taskMoved = draft[from];
        draft.splice(from, 1);
        draft.splice(to, 0, taskMoved);
      })
    );
  }, [setTasks]);

  const handleStatus = useCallback((task) => {
    setTasks(
      produce(tasks, draft => {
        const foundIndex = draft.findIndex(item => item.id === task.id);
        draft[foundIndex].closed = !draft[foundIndex].closed;
        console.log('Updated tasks:', [...tasks]);
      })
    );
  }, [setTasks, tasks]);

  const addTask = useCallback(() => {
    if (input.trim()) {
      setTasks(
        produce(tasks, draft => {
          draft.push({ id: Date.now(), title: input, closed: false });
        })
      );
      setInput('');
    }
  }, [input, setTasks]);

  const deleteTask = useCallback((id) => {
    setTasks(prevTasks =>
      produce(prevTasks, draft => {
        const indexToDelete = draft.findIndex(task => task.id === id);
        if (indexToDelete !== -1) {
          draft.splice(indexToDelete, 1);
        }
      })
    );
  }, [setTasks]);

  return (
    <div>
      <h1>Pomonade Task</h1>
      <h3>Semangat nugasnya😘</h3>
      <TaskContext.Provider value={{ tasks, move, handleStatus, deleteTask }}>
        <TypeSelect
          types={taskStatus}
          selected={selectedStatus}
          changeType={setSelectedStatus}
        />
        <div className="Tasks">
          <div className="Tasks-box">
            {tasks.length > 0 ? (
              tasks
                .filter(
                  task =>
                    task.closed === selectedStatus.value ||
                    selectedStatus.value === -1
                )
                .map((task, index) => (
                  <Task key={task.id} index={index} task={task} />
                ))
            ) : (
              <div className="Task">No Tasks</div>
            )}
          </div>
        </div>
        <div className="Task-add">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="New Task"
          />
          <button onClick={addTask} className="add-button">
            Add
          </button>
        </div>
      </TaskContext.Provider>
    </div>
  );
};

export default memo(TaskList);
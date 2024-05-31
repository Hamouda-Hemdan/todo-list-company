import React from 'react';
import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggleStatus: (taskId: number, currentStatus: string) => void;
  onDelete: (taskId: number) => void;
  onToggleFavorite: (taskId: number) => void;
  onEdit: (taskId: number) => void;
  isFavorite: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleStatus,
  onDelete,
  onToggleFavorite,
  onEdit,
  isFavorite,
}) => {
  return (
    <li className="task-item">
      <div className="task-item-container">
        <span className="task-title">{task.title}</span>
        <span className="task-description">{task.description}</span>
        <div className="task-actions">
          <button onClick={() => onToggleStatus(task.id, task.status)} className="status-button">
            {task.status === 'completed' ? 'Undo' : 'Complete'}
          </button>
          <button onClick={() => onDelete(task.id)} className="delete-button">Delete</button>
          <button onClick={() => onToggleFavorite(task.id)} className="favorite-button">
            {isFavorite ? 'Unfavorite' : 'Favorite'}
          </button>
          <button onClick={() => onEdit(task.id)} className="edit-button">Edit</button>
        </div>
      </div>
    </li>
  );
};

export default TaskItem;

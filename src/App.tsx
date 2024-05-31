import React, { useEffect, useState } from "react";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import { Task } from "./types";

const API_URL = "https://cms.dev-land.host/api/tasks";
const JWT_TOKEN =
  "a56017bfd8f1a9d1c8d012e881ef7df90ddc4e3d74e61a27b82fa975cfe37571fcb0e7617258e871291c4315b68c1c410274fb19269becf5dae7b5372d611d66c605c701817bd70f8fcd39aa44973e95fb1dff1b36e3271ba4bf890e074e52d9b9feddcee0947e588d7b5f6eef4bd4ead3993c6ee7b35ffddf22012c2b5589ed";

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [favorites, setFavorites] = useState<number[]>(() =>
    JSON.parse(localStorage.getItem("favorites") || "[]")
  );

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${JWT_TOKEN}`,
        },
      });
      const data = await response.json();
      setTasks(
        data.data.map((task: any) => ({
          id: task.id,
          ...task.attributes,
        }))
      );
    };

    fetchTasks();
  }, []);

  const addTask = async (title: string, description: string) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${JWT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          title,
          description,
          status: "not_completed",
        },
      }),
    });
    const data = await response.json();
    setTasks([...tasks, { id: data.data.id, ...data.data.attributes }]);
  };

  const deleteTask = async (taskId: number) => {
    await fetch(`${API_URL}/${taskId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${JWT_TOKEN}`,
      },
    });
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const toggleTaskStatus = async (taskId: number, currentStatus: string) => {
    const newStatus =
      currentStatus === "completed" ? "not_completed" : "completed";
    const task = tasks.find((task) => task.id === taskId);
    if (!task) return;

    const response = await fetch(`${API_URL}/${taskId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${JWT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          title: task.title,
          description: task.description,
          status: newStatus,
        },
      }),
    });

    if (!response.ok) {
      console.error("Failed to update task status");
      return;
    }

    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const toggleFavorite = (taskId: number) => {
    const updatedFavorites = favorites.includes(taskId)
      ? favorites.filter((id) => id !== taskId)
      : [...favorites, taskId];
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  const editTask = async (taskId: number) => {
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) {
      console.error("Task not found");
      return;
    }

    const newTitle = prompt("Enter the new title:", tasks[taskIndex].title);
    const newDescription = prompt(
      "Enter the new description:",
      tasks[taskIndex].description
    );

    if (newTitle === null || newDescription === null) {
      return;
    }

    const response = await fetch(`${API_URL}/${taskId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${JWT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          title: newTitle,
          description: newDescription,
          status: tasks[taskIndex].status,
        },
      }),
    });

    if (!response.ok) {
      console.error("Failed to update task");
      return;
    }

    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? { ...task, title: newTitle, description: newDescription }
          : task
      )
    );
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.status === "completed";
    if (filter === "not_completed") return task.status !== "completed";
    if (filter === "favorites") return favorites.includes(task.id);
    return true;
  });

  return (
    <div id="app">
      <h1>Todo List</h1>
      <TaskForm onAddTask={addTask} />
      <div className="filter-container">
        <button className="filter-button" onClick={() => setFilter("all")}>
          All
        </button>
        <button
          className="filter-button"
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
        <button
          className="filter-button"
          onClick={() => setFilter("not_completed")}
        >
          Not Completed
        </button>
        <button
          className="filter-button"
          onClick={() => setFilter("favorites")}
        >
          Favorites
        </button>
      </div>
      <TaskList
        tasks={filteredTasks}
        onToggleStatus={toggleTaskStatus}
        onDelete={deleteTask}
        onToggleFavorite={toggleFavorite}
        onEdit={editTask}
        favorites={favorites}
      />
    </div>
  );
};

export default App;

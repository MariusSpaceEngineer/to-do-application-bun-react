import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Form } from "react-bulma-components";
import "bulma/css/bulma.min.css";

const { Input } = Form;

// Create an axios instance
const api = axios.create({
  baseURL: "http://localhost:3000",
});

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ date: "", description: "" });
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [updateTaskId, setUpdateTaskId] = useState(null); // Add this line

  // Fetch tasks from the server
  useEffect(() => {
    api
      .get("/tasks")
      .then((response) => {
        setTasks(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, []);

  // Function to create a new task
  const createTask = (event) => {
    event.preventDefault();
    setShowUpdateForm(false); // Ensure the update form is closed
    api
      .post("/tasks", newTask)
      .then((response) => {
        setTasks([...tasks, response.data]);
        setNewTask({ date: "", description: "" }); // Clear the form
        setShowCreateForm(false); // Hide the create form
      })
      .catch((error) => {
        console.error("Error creating task: ", error);
      });
  };

  // Function to update a task
  const updateTask = (id) => {
    setShowCreateForm(false); // Ensure the create form is closed
    const taskToUpdate = tasks.find((task) => task.id === id);
    setNewTask(taskToUpdate);
    setShowUpdateForm(true);
    setUpdateTaskId(id); // Add this line
  };

  // Function to handle the update form submission
  const handleUpdate = (event) => {
    event.preventDefault();
    if (newTask.date && newTask.description) {
      api
        .put(`/tasks/${newTask.id}`, newTask)
        .then((response) => {
          setTasks(
            tasks.map((task) => (task.id === newTask.id ? response.data : task))
          );
          setNewTask({ date: "", description: "" }); // Clear the form
          setShowUpdateForm(false); // Hide the update form
        })
        .catch((error) => {
          console.error("Error updating task: ", error);
        });
    } else {
      alert("Please fill both the date and description fields.");
    }
  };

  // Function to delete a task
  const deleteTask = (id) => {
    api
      .delete(`/tasks/${id}`)
      .then(() => {
        setTasks(tasks.filter((task) => task.id !== id));
      })
      .catch((error) => {
        console.error("Error deleting task: ", error);
      });
  };

  return (
    <div className="App">
      {/* List of tasks */}
      {tasks.map((task) => (
        <div key={task.id}>
          <h2>{task.description}</h2>
          <p>{task.date}</p>
          <Button color="success" onClick={() => updateTask(task.id)}>
            Update
          </Button>
          <Button color="danger" onClick={() => deleteTask(task.id)}>
            Delete
          </Button>

          {/* Update form */}
          {showUpdateForm && updateTaskId === task.id && (
            <form onSubmit={handleUpdate}>
              <Input
                type="date"
                value={newTask.date}
                onChange={(e) =>
                  setNewTask({ ...newTask, date: e.target.value })
                }
                required
              />
              <Input
                type="text"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                required
              />
              <Button type="submit" color="success">
                Update Task
              </Button>
              <Button
                type="button"
                color="danger"
                onClick={() => setShowUpdateForm(false)}
              >
                Close
              </Button>
            </form>
          )}
        </div>
      ))}

      {/* Button to show the create form */}
      {!showUpdateForm && (
        <Button color="success" onClick={() => setShowCreateForm(true)}>
          Create New Task
        </Button>
      )}

      {/* Form to create a new task */}
      {showCreateForm && (
        <form onSubmit={createTask}>
          <Input
            type="date"
            value={newTask.date}
            onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
            required
          />
          <Input
            type="text"
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
            required
          />
          <Button type="submit" color="success">
            Create Task
          </Button>
          <Button
            type="button"
            color="danger"
            onClick={() => setShowCreateForm(false)}
          >
            Close
          </Button>
        </form>
      )}
    </div>
  );
}

export default App;

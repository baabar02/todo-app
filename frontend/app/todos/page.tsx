"use client";
import { useState, useEffect } from "react";
import { getTodos, createTodo, updateTodo, deleteTodo } from "../../lib/api";
import { useRouter } from "next/navigation";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export default function TodosPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const fetchTodos = async () => {
    try {
      const res = await getTodos();
      setTodos(res.data);
    } catch (error) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const timer = setTimeout(() => {
      fetchTodos();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const res = await createTodo(newTitle);
      setTodos([res.data, ...todos]);
      setNewTitle("");
      console.log(res.data, "Todo created successfully");
    } catch (error) {
      console.log(error);
    }
  };

  const handleToggle = async (todo: Todo) => {
    try {
      const res = await updateTodo(todo.id, { completed: !todo.completed });
      setTodos(todos.map((t) => (t.id === todo.id ? res.data : t)));
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter((t) => t.id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditId(todo.id);
    setEditTitle(todo.title);
    console.log(todo.title, "Editing todo");
  };

  const handleEditSave = async (id: string) => {
    if (!editTitle.trim()) return;
    try {
      const res = await updateTodo(id, { title: editTitle });
      setTodos(todos.map((t) => (t.id === id ? res.data : t)));
      setEditId(null);
      setEditTitle("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };
  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-xl mx-auto py-10 px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Todos</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>

        {/* Create todo form */}
        <form onSubmit={handleCreate} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Add a new todo..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="border p-3 rounded-lg flex-1"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Add
          </button>
        </form>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {(["all", "active", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-500 hover:bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Todo list */}
        {filteredTodos.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">No todos here!</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {filteredTodos.map((todo) => (
              <li
                key={todo.id}
                className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggle(todo)}
                    className="w-5 h-5 cursor-pointer"
                  />
                  {editId === todo.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="border p-1 rounded flex-1"
                      autoFocus
                    />
                  ) : (
                    <span
                      className={
                        todo.completed ? "line-through text-gray-400" : ""
                      }
                    >
                      {todo.title}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {editId === todo.id ? (
                    <>
                      <button
                        onClick={() => handleEditSave(todo.id)}
                        className="text-green-500 hover:text-green-700 text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="text-gray-400 hover:text-gray-600 text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(todo)}
                        className="text-blue-400 hover:text-blue-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="text-red-400 hover:text-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

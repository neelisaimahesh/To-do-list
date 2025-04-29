import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { FormEvent, useState } from "react";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold accent-text">Todo List</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md mx-auto">
          <Content />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const todos = useQuery(api.todos.list) ?? [];
  const [newTodo, setNewTodo] = useState("");
  const create = useMutation(api.todos.create);
  const toggle = useMutation(api.todos.toggle);
  const remove = useMutation(api.todos.remove);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!newTodo.trim()) return;
    await create({ text: newTodo });
    setNewTodo("");
  }

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold accent-text mb-4">Todo List</h1>
        <Authenticated>
          <p className="text-xl text-slate-600">
            Welcome back, {loggedInUser?.email ?? "friend"}!
          </p>
        </Authenticated>
        <Unauthenticated>
          <p className="text-xl text-slate-600">Sign in to manage your todos</p>
        </Unauthenticated>
      </div>

      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>

      <Authenticated>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
            className="flex-1 px-4 py-2 border rounded"
          />
          <button
            type="submit"
            disabled={!newTodo.trim()}
            className="px-4 py-2 bg-indigo-500 text-white rounded disabled:opacity-50"
          >
            Add
          </button>
        </form>

        <ul className="flex flex-col gap-2">
          {todos.map((todo) => (
            <li
              key={todo._id}
              className="flex items-center gap-2 p-2 border rounded"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggle({ id: todo._id })}
                className="h-5 w-5"
              />
              <span className={todo.completed ? "line-through flex-1" : "flex-1"}>
                {todo.text}
              </span>
              <button
                onClick={() => remove({ id: todo._id })}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </Authenticated>
    </div>
  );
}

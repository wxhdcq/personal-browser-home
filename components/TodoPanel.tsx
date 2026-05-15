"use client";

import { Check, Plus, Square, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { SurfaceCard } from "@/components/SurfaceCard";
import { storageKeys } from "@/data/storageKeys";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { TodoItem } from "@/types/home";

function createTodo(title: string): TodoItem {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
    title,
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

function todoTime(index: number) {
  return ["09:00", "12:00", "15:00", "20:00"][index % 4];
}

export function TodoPanel() {
  const [todos, setTodos, isLoaded] = useLocalStorage<TodoItem[]>(
    storageKeys.todos,
    [],
  );
  const [title, setTitle] = useState("");

  const completedCount = useMemo(
    () => todos.filter((todo) => todo.completed).length,
    [todos],
  );

  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    setTodos((currentTodos) => [createTodo(trimmedTitle), ...currentTodos]);
    setTitle("");
  }

  function toggleTodo(id: string) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }

  function deleteTodo(id: string) {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  }

  return (
    <SurfaceCard id="today-todo" className="h-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">今日待办</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoaded ? `已完成 ${completedCount} / ${todos.length}` : "读取中"}
          </p>
        </div>
        <button
          type="submit"
          form="todo-form"
          className="inline-flex h-9 items-center gap-1 rounded-lg bg-primary/10 px-3 text-sm font-medium text-primary transition hover:bg-primary hover:text-primary-foreground"
        >
          <Plus aria-hidden size={16} />
          添加
        </button>
      </div>

      <form id="todo-form" onSubmit={addTodo} className="mt-4">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
          placeholder="添加今天要完成的任务"
        />
      </form>

      <div className="mt-5 space-y-4">
        {todos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-background px-4 py-8 text-center text-sm text-muted-foreground">
            今天还没有待办
          </div>
        ) : (
          todos.slice(0, 5).map((todo, index) => (
            <div key={todo.id} className="group flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleTodo(todo.id)}
                className={[
                  "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border transition",
                  todo.completed
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-soft text-transparent hover:border-primary",
                ].join(" ")}
                aria-label={todo.completed ? "标记为未完成" : "标记为完成"}
              >
                {todo.completed ? (
                  <Check aria-hidden size={14} />
                ) : (
                  <Square aria-hidden size={1} />
                )}
              </button>
              <span
                className={[
                  "min-w-0 flex-1 truncate text-sm",
                  todo.completed
                    ? "text-muted-foreground line-through"
                    : "text-foreground",
                ].join(" ")}
              >
                {todo.title}
              </span>
              <span className="hidden shrink-0 text-sm text-muted-foreground sm:block">
                {todo.completed ? "完成" : todoTime(index)}
              </span>
              <button
                type="button"
                onClick={() => deleteTodo(todo.id)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-0 transition hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
                aria-label="删除待办"
                title="删除"
              >
                <Trash2 aria-hidden size={15} />
              </button>
            </div>
          ))
        )}
      </div>
    </SurfaceCard>
  );
}

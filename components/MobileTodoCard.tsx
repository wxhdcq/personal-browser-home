"use client";

import { Check, ClipboardCheck } from "lucide-react";
import { SurfaceCard } from "@/components/SurfaceCard";
import { storageKeys } from "@/data/storageKeys";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { TodoItem } from "@/types/home";

const previewTodos = ["完成产品需求", "健身锻炼", "学习新知识"];

export function MobileTodoCard() {
  const [todos, setTodos] = useLocalStorage<TodoItem[]>(storageKeys.todos, []);
  const visibleTodos =
    todos.length > 0
      ? todos.slice(0, 3)
      : previewTodos.map((title, index) => ({
          id: `preview-${index}`,
          title,
          completed: false,
          createdAt: "",
        }));

  function toggleTodo(id: string) {
    if (id.startsWith("preview-")) return;

    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }

  return (
    <SurfaceCard id="today-todo" padding="sm">
      <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
        <ClipboardCheck aria-hidden size={18} className="text-primary" />
        今日待办
      </h2>
      <div className="mt-4 space-y-3">
        {visibleTodos.map((todo) => (
          <button
            key={todo.id}
            type="button"
            onClick={() => toggleTodo(todo.id)}
            className="flex w-full items-center gap-3 text-left text-sm text-foreground"
          >
            <span
              className={[
                "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                todo.completed
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-soft",
              ].join(" ")}
            >
              {todo.completed ? <Check aria-hidden size={13} /> : null}
            </span>
            <span className={todo.completed ? "line-through opacity-60" : ""}>
              {todo.title}
            </span>
          </button>
        ))}
      </div>
    </SurfaceCard>
  );
}

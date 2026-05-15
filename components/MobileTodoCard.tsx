"use client";

import { Check, ClipboardCheck } from "lucide-react";
import { storageKeys } from "@/data/storageKeys";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { SurfaceCard } from "@/components/SurfaceCard";
import type { TodoItem } from "@/types/home";

const previewTodos = ["完成产品需求评审", "回复重要邮件", "学习设计规范更新"];

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
    <SurfaceCard id="today-todo" className="min-h-[218px]">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <ClipboardCheck aria-hidden size={19} className="text-primary" />
        今日待办
      </h2>
      <div className="mt-6 space-y-5">
        {visibleTodos.map((todo) => (
          <button
            key={todo.id}
            type="button"
            onClick={() => toggleTodo(todo.id)}
            className="flex w-full items-center gap-3 text-left text-sm text-foreground disabled:cursor-default"
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

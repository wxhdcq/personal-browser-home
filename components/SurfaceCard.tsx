import type { ComponentPropsWithoutRef } from "react";

type SurfacePadding = "sm" | "md" | "none";

interface SurfaceCardProps extends ComponentPropsWithoutRef<"section"> {
  padding?: SurfacePadding;
}

const paddingClass: Record<SurfacePadding, string> = {
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-6",
  none: "",
};

export function SurfaceCard({
  children,
  className = "",
  padding = "md",
  ...props
}: SurfaceCardProps) {
  return (
    <section
      {...props}
      className={[
        "rounded-2xl border border-border bg-card shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:rounded-lg",
        paddingClass[padding],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </section>
  );
}

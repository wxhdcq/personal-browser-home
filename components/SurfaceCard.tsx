import type { ComponentPropsWithoutRef } from "react";

type SurfacePadding = "sm" | "md" | "none";

interface SurfaceCardProps extends ComponentPropsWithoutRef<"section"> {
  padding?: SurfacePadding;
}

const paddingClass: Record<SurfacePadding, string> = {
  sm: "p-4",
  md: "p-6",
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
        "rounded-lg border border-border bg-card shadow-[0_18px_50px_rgba(15,23,42,0.08)]",
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

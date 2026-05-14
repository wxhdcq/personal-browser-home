import { ReactNode } from "react";
import { AppTopBar } from "@/components/AppTopBar";
import { SideNavigation } from "@/components/SideNavigation";

interface AppFrameProps {
  children: ReactNode;
}

export function AppFrame({ children }: AppFrameProps) {
  return (
    <main className="min-h-screen text-foreground">
      <AppTopBar />
      <div className="mx-auto flex max-w-[1760px] flex-col gap-6 px-5 py-8 lg:flex-row">
        <SideNavigation />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </main>
  );
}

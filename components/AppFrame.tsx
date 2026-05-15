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
      <div className="mx-auto flex max-w-[1760px] flex-col gap-5 px-4 pb-6 pt-5 sm:px-5 lg:flex-row lg:gap-6 lg:py-8">
        <SideNavigation />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </main>
  );
}

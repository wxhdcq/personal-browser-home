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
      <div className="mx-auto grid w-full max-w-[1720px] grid-cols-1 gap-5 px-4 pb-6 pt-5 sm:px-5 lg:grid-cols-[150px_minmax(0,1fr)] lg:gap-5 lg:py-7 xl:grid-cols-[164px_minmax(0,1fr)] xl:gap-6 2xl:px-6">
        <SideNavigation />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </main>
  );
}

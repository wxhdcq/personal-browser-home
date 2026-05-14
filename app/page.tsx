import { AppFrame } from "@/components/AppFrame";
import { ClockGreeting } from "@/components/ClockGreeting";
import { HomeDashboard } from "@/components/HomeDashboard";
import { DailyQuoteCard, HomeSidebar } from "@/components/HomeSidebar";
import { SearchBox } from "@/components/SearchBox";
import { searchEngines } from "@/data/searchEngines";
import { shortcuts } from "@/data/shortcuts";

export default function Home() {
  return (
    <AppFrame>
      <div className="mx-auto max-w-[1450px]">
        <div className="grid items-start gap-8 pt-4 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="min-w-0">
            <ClockGreeting />
            <div className="mt-8">
              <SearchBox engines={searchEngines} />
            </div>
            <div className="mt-9">
              <HomeDashboard shortcuts={shortcuts} />
            </div>
          </div>
          <div className="grid gap-6 xl:pt-1">
            <DailyQuoteCard />
            <HomeSidebar />
          </div>
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          The best way to predict the future is to create it.
          <span className="ml-2">— Peter Drucker</span>
        </p>
      </div>
    </AppFrame>
  );
}

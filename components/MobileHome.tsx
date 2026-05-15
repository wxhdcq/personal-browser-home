import { DailyQuoteCard } from "@/components/DailyQuoteCard";
import { MobileTodoCard } from "@/components/MobileTodoCard";
import { SearchBox } from "@/components/SearchBox";
import { ShortcutGrid } from "@/components/ShortcutGrid";
import type { SearchEngine, ShortcutLink } from "@/types/home";

const mobileShortcutIds = [
  "chatgpt",
  "github",
  "notion",
  "youtube",
  "vercel",
  "tradingview",
];

const mobileEngineIds = ["google", "youtube", "github", "perplexity"];

interface MobileHomeProps {
  engines: SearchEngine[];
  shortcuts: ShortcutLink[];
}

export function MobileHome({ engines, shortcuts }: MobileHomeProps) {
  const mobileEngines = engines.filter((engine) =>
    mobileEngineIds.includes(engine.id),
  );
  const mobileShortcuts = shortcuts.filter((shortcut) =>
    mobileShortcutIds.includes(shortcut.id),
  );

  return (
    <div className="grid gap-7 pt-8">
      <SearchBox engines={mobileEngines} />
      <ShortcutGrid shortcuts={mobileShortcuts} showManage={false} />
      <div className="grid grid-cols-2 gap-4">
        <MobileTodoCard />
        <DailyQuoteCard variant="compact" />
      </div>
    </div>
  );
}

import { MobileTodoCard } from "@/components/MobileTodoCard";
import { SearchBox } from "@/components/SearchBox";
import { ShortcutGrid } from "@/components/ShortcutGrid";
import { WeatherCard } from "@/components/WeatherCard";
import type { SearchEngine, ShortcutLink } from "@/types/home";

const mobileShortcutIds = [
  "github",
  "vercel",
  "youtube",
  "chatgpt",
  "notion",
  "google-translate",
];

interface MobileHomeProps {
  engines: SearchEngine[];
  shortcuts: ShortcutLink[];
}

export function MobileHome({ engines, shortcuts }: MobileHomeProps) {
  const mobileShortcuts = mobileShortcutIds
    .map((id) => shortcuts.find((shortcut) => shortcut.id === id))
    .filter((shortcut): shortcut is ShortcutLink => Boolean(shortcut));

  return (
    <div className="grid gap-5 pt-2">
      <SearchBox engines={engines} showEngines={false} />
      <ShortcutGrid
        shortcuts={mobileShortcuts}
        showManage={false}
        variant="compact"
      />
      <MobileTodoCard />
      <WeatherCard variant="compact" />
    </div>
  );
}

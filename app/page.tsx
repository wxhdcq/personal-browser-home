import { AppFrame } from "@/components/AppFrame";
import { ResponsiveHome } from "@/components/ResponsiveHome";
import { searchEngines } from "@/data/searchEngines";
import { shortcuts } from "@/data/shortcuts";

export default function Home() {
  return (
    <AppFrame>
      <ResponsiveHome engines={searchEngines} shortcuts={shortcuts} />
    </AppFrame>
  );
}

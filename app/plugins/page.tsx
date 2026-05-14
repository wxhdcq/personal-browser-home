import { AppFrame } from "@/components/AppFrame";
import { PageHeader } from "@/components/PageHeader";
import { PluginsPanel } from "@/components/PluginsPanel";

export default function PluginsPage() {
  return (
    <AppFrame>
      <PageHeader
        title="插件"
        description="这里先管理首页内部模块，不直接管理 Chrome 扩展。这样权限更干净，也更适合后续扩展化。"
      />
      <PluginsPanel />
    </AppFrame>
  );
}

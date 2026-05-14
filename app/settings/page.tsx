import { AppFrame } from "@/components/AppFrame";
import { PageHeader } from "@/components/PageHeader";
import { SettingsPanel } from "@/components/SettingsPanel";

export default function SettingsPage() {
  return (
    <AppFrame>
      <PageHeader
        title="设置"
        description="管理默认搜索引擎、首页偏好、历史记录开关，以及本地数据导入导出。"
      />
      <SettingsPanel />
    </AppFrame>
  );
}

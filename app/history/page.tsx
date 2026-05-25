import { AppFrame } from "@/components/AppFrame";
import { BrowserHistoryPanel } from "@/components/BrowserHistoryPanel";
import { HistoryPanel } from "@/components/HistoryPanel";
import { PageHeader } from "@/components/PageHeader";

export default function HistoryPage() {
  return (
    <AppFrame>
      <PageHeader
        title="历史记录"
        description="查看扩展读取到的浏览器历史，以及首页内产生的搜索、快捷入口、书签和下载点击。"
      />
      <div className="grid gap-4">
        <BrowserHistoryPanel />
        <HistoryPanel />
      </div>
    </AppFrame>
  );
}

import { AppFrame } from "@/components/AppFrame";
import { HistoryPanel } from "@/components/HistoryPanel";
import { PageHeader } from "@/components/PageHeader";

export default function HistoryPage() {
  return (
    <AppFrame>
      <PageHeader
        title="历史记录"
        description="记录从首页发起的搜索、快捷入口、书签和下载点击。扩展版可接入 chrome.history。"
      />
      <HistoryPanel />
    </AppFrame>
  );
}

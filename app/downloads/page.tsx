import { AppFrame } from "@/components/AppFrame";
import { DownloadsPanel } from "@/components/DownloadsPanel";
import { PageHeader } from "@/components/PageHeader";

export default function DownloadsPage() {
  return (
    <AppFrame>
      <PageHeader
        title="下载"
        description="第一版作为常用下载入口和资料入口。后续扩展版可接入 chrome.downloads 展示真实下载历史。"
      />
      <DownloadsPanel />
    </AppFrame>
  );
}

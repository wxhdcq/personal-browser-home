import { AppFrame } from "@/components/AppFrame";
import { BrowserDownloadsPanel } from "@/components/BrowserDownloadsPanel";
import { DownloadsPanel } from "@/components/DownloadsPanel";
import { PageHeader } from "@/components/PageHeader";

export default function DownloadsPage() {
  return (
    <AppFrame>
      <PageHeader
        title="下载"
        description="查看扩展读取到的浏览器下载记录，也保留常用下载入口和资料入口。"
      />
      <div className="grid gap-4">
        <BrowserDownloadsPanel />
        <DownloadsPanel />
      </div>
    </AppFrame>
  );
}

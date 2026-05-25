import { AppFrame } from "@/components/AppFrame";
import { BrowserBookmarksPanel } from "@/components/BrowserBookmarksPanel";
import { BookmarkManager } from "@/components/BookmarkManager";
import { PageHeader } from "@/components/PageHeader";

export default function BookmarksPage() {
  return (
    <AppFrame>
      <PageHeader
        title="快捷入口管理"
        description="查看浏览器真实书签，并管理首页快捷入口，支持新增、编辑、删除和调整顺序。"
      />
      <div className="grid gap-4">
        <BrowserBookmarksPanel />
        <BookmarkManager />
      </div>
    </AppFrame>
  );
}

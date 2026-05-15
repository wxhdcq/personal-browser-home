import { AppFrame } from "@/components/AppFrame";
import { BookmarkManager } from "@/components/BookmarkManager";
import { PageHeader } from "@/components/PageHeader";

export default function BookmarksPage() {
  return (
    <AppFrame>
      <PageHeader
        title="快捷入口管理"
        description="管理首页右侧快捷入口，支持新增、编辑、删除和调整顺序，数据保存在本地浏览器。"
      />
      <BookmarkManager />
    </AppFrame>
  );
}

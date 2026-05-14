import { AppFrame } from "@/components/AppFrame";
import { BookmarkManager } from "@/components/BookmarkManager";
import { PageHeader } from "@/components/PageHeader";

export default function BookmarksPage() {
  return (
    <AppFrame>
      <PageHeader
        title="书签"
        description="管理自己的常用网站。第一版使用本地数据和 localStorage，后续可替换为 chrome.bookmarks。"
      />
      <BookmarkManager />
    </AppFrame>
  );
}

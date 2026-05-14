import { AppFrame } from "@/components/AppFrame";
import { NotesManager } from "@/components/NotesManager";
import { PageHeader } from "@/components/PageHeader";

export default function NotesPage() {
  return (
    <AppFrame>
      <PageHeader
        title="笔记"
        description="本地笔记系统，支持新增、编辑、删除、置顶和搜索。后续可以迁移到 chrome.storage.sync。"
      />
      <NotesManager />
    </AppFrame>
  );
}

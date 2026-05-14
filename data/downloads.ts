import type { DownloadResource } from "@/types/home";

export const downloadResources: DownloadResource[] = [
  {
    id: "vscode",
    name: "Visual Studio Code",
    url: "https://code.visualstudio.com/Download",
    description: "前端开发编辑器，适合项目日常维护。",
    category: "开发工具",
    sizeLabel: "安装器",
    updatedAt: "2026-05-14",
  },
  {
    id: "nodejs",
    name: "Node.js LTS",
    url: "https://nodejs.org/en/download",
    description: "Next.js 与前端工具链运行环境。",
    category: "开发工具",
    sizeLabel: "LTS",
    updatedAt: "2026-05-14",
  },
  {
    id: "chrome",
    name: "Google Chrome",
    url: "https://www.google.com/chrome/",
    description: "浏览器与扩展调试环境。",
    category: "常用软件",
    sizeLabel: "在线安装",
    updatedAt: "2026-05-14",
  },
  {
    id: "cloudflare-docs",
    name: "Cloudflare Docs",
    url: "https://developers.cloudflare.com/",
    description: "DNS、Workers、Pages 和安全配置文档。",
    category: "文档资料",
    sizeLabel: "在线文档",
    updatedAt: "2026-05-14",
  },
  {
    id: "ubuntu-server",
    name: "Ubuntu Server",
    url: "https://ubuntu.com/download/server",
    description: "服务器系统镜像与云主机初始化参考。",
    category: "服务器",
    sizeLabel: "ISO",
    updatedAt: "2026-05-14",
  },
];

import type { SearchEngine } from "@/types/home";

export const searchEngines: SearchEngine[] = [
  {
    id: "google",
    name: "Google",
    iconUrl: "https://www.google.com/s2/favicons?domain=google.com&sz=64",
    placeholder: "搜索或输入网址",
    urlTemplate: "https://www.google.com/search?q={query}",
  },
  {
    id: "bing",
    name: "Bing",
    iconUrl: "https://www.google.com/s2/favicons?domain=bing.com&sz=64",
    placeholder: "用 Bing 搜索",
    urlTemplate: "https://www.bing.com/search?q={query}",
  },
  {
    id: "youtube",
    name: "YouTube",
    iconUrl: "https://www.google.com/s2/favicons?domain=youtube.com&sz=64",
    placeholder: "搜索 YouTube 视频",
    urlTemplate: "https://www.youtube.com/results?search_query={query}",
  },
  {
    id: "github",
    name: "GitHub",
    iconUrl: "https://www.google.com/s2/favicons?domain=github.com&sz=64",
    placeholder: "搜索 GitHub 项目和代码",
    urlTemplate: "https://github.com/search?q={query}",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    iconUrl: "https://www.google.com/s2/favicons?domain=perplexity.ai&sz=64",
    placeholder: "用 Perplexity 提问",
    urlTemplate: "https://www.perplexity.ai/search?q={query}",
  },
];

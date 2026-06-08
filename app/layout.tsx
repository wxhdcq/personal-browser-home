import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "个人浏览器首页",
  description: "一个可部署、可扩展为 Chrome 新标签页扩展的个人浏览器首页。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
};

const appTarget =
  process.env.NEXT_PUBLIC_APP_TARGET === "extension" ? "extension" : undefined;

const initialThemeScript = `
(function () {
  try {
    var stored = window.localStorage.getItem("personal-home.theme");
    var theme = stored === "dark" || stored === "cyberpunk" ? stored : "light";
    var root = document.documentElement;
    root.classList.remove("dark", "cyberpunk");
    if (theme === "dark") root.classList.add("dark");
    if (theme === "cyberpunk") root.classList.add("cyberpunk");
    root.style.colorScheme = theme === "light" ? "light" : "dark";
  } catch (error) {
    document.documentElement.style.colorScheme = "light";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      data-app-target={appTarget}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: initialThemeScript }} />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

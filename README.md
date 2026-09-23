# Research in 2026

科研工作流公开手册，包含九章：工具与项目管理、文献与实验、写作与协作。

在线阅读：https://delong-l.github.io/Research-Workflow-2026/

这是独立的静态网站，不需要账号、访问码或服务器端服务。仓库中的 `src/` 保存可编辑的公开页面、样式、字体和图片；`docs/` 是 GitHub Pages 发布目录。

## 本地修改与构建

需要 Node.js 22.13 或更新版本。

```sh
npm ci
npm run build
npm run check
```

修改 `src/pages/` 中的页面和 `src/assets/` 中的样式。构建只读取本仓库内容，不抓取其他站点，并自动重建 Pagefind 搜索索引。

发布前检查本地效果，将源码与生成后的 `docs/` 一起提交。GitHub Pages 使用 `main` 分支的 `/docs` 目录。

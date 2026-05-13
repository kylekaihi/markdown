---
title: "把 Markdown 博客部署到边缘"
description: "一个文件式博客的最小闭环：写 Markdown，构建静态页面，然后交给 Cloudflare Pages。"
date: 2026-05-12
tags: ["Cloudflare", "Markdown", "Astro"]
cover: "/images/edge-notes-cover.svg"
coverAlt: "Markdown 笔记、图片和代码块组成的安静写作界面"
draft: false
---

Markdown 博客最迷人的地方，是它让写作重新变得直接。文章存在仓库里，格式清楚，迁移也容易。

## 为什么选静态博客

- 内容可以用 Git 管理。
- 页面生成后没有运行时数据库依赖。
- Cloudflare Pages 可以直接托管构建产物。

> 好的工具应该让发布变安静，而不是让写作者一直注意工具本身。

![一篇技术文章可以同时容纳说明图、正文和代码。](/images/edge-notes-cover.svg)

部署命令也可以保持简单：

```sh
npm run build
npx wrangler pages deploy dist --project-name minimal-markdown-blog
```

如果你想写代码教程，也可以放带语言标记的代码块：

```ts
type Post = {
  title: string;
  description: string;
  tags: string[];
};

const publish = (post: Post) => `${post.title} is ready`;
```

这个站点的第一版刻意不做后台、评论和复杂筛选。先把阅读体验做好，再决定要不要加更多东西。

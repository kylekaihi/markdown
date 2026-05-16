---
title: "使用 Cloudflare R2 做博客图床"
description: "一个可复用的博客图片发布流程：图片上传到 R2，文章里只保留稳定的固定 URL。"
date: 2026-05-16
tags: ["Cloudflare", "R2", "Blog"]
draft: false
---

把博客图片放进仓库当然简单，但文章越来越多以后，图片会让仓库变重，迁移和同步也不够轻。更舒服的做法，是把图片上传到 Cloudflare R2，然后在 Markdown 里只引用一个固定 URL。

这篇文章记录本站现在使用的最小流程：R2 负责存图片，Cloudflare custom domain 负责提供稳定访问地址，博客文章只保存图片 URL。

## 准备 R2 图床

先在 Cloudflare 后台创建一个 R2 bucket，例如：

```txt
quiet-edge-images
```

然后在 bucket 的 Settings 里绑定一个自有域名，例如：

```txt
https://img.example.com
```

`r2.dev` 地址适合临时测试；正式博客更建议使用自有域名。这样文章里的图片地址不会随着开发环境变化，也可以吃到 Cloudflare 的缓存能力。

## 上传图片

项目里已经有一个上传脚本。第一次使用前，先登录 Wrangler：

```sh
npx wrangler login
```

上传一张封面图：

```sh
R2_BUCKET=quiet-edge-images \
R2_PUBLIC_URL=https://img.example.com \
npm run upload:image -- ./cover.jpg images/r2-image-hosting-cover.jpg
```

命令完成后会输出固定 URL 和可直接粘贴的 Markdown：

```md
![cover](https://img.example.com/images/r2-image-hosting-cover.jpg)
```

如果不手动指定第二个参数，脚本会默认把图片上传到：

```txt
images/<原文件名>
```

## 写进文章

封面图放在 frontmatter 里：

```md
---
title: "使用 Cloudflare R2 做博客图床"
description: "一个可复用的博客图片发布流程。"
date: 2026-05-16
tags: ["Cloudflare", "R2", "Blog"]
cover: "https://img.example.com/images/r2-image-hosting-cover.jpg"
coverAlt: "Cloudflare R2 bucket 里的博客封面图片"
draft: false
---
```

正文图片就直接使用 Markdown 图片语法：

```md
![Cloudflare R2 bucket 里的博客封面图片](https://img.example.com/images/r2-image-hosting-cover.jpg)
```

这样构建出来的静态页面不会关心图片从哪里上传，也不需要把图片复制到 `public/images`。文章只需要保留最终可访问的固定 URL。

## 发布前检查

发布前跑一遍：

```sh
npm run verify
npm run build
```

如果以后替换图片，建议换一个新的对象 key，例如：

```txt
images/r2-image-hosting-cover-v2.jpg
```

不要直接覆盖已经长期缓存的同名图片。固定 URL 很适合长期引用，但缓存也意味着同名文件不会总是立刻刷新。

## 这个方案的边界

这个流程适合个人博客、技术笔记和长期文章配图。它没有做后台上传界面，也没有做图片裁剪、压缩和审核。如果需要更完整的媒体工作流，可以再加图片压缩脚本，或者把上传动作接进 CMS。

对现在这个博客来说，最重要的是保持写作链路简单：图片上传到 R2，拿到 URL，贴进 Markdown，然后发布。

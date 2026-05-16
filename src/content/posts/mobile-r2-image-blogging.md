---
title: "在手机上用 R2 图床写博客"
description: "一个手机端写作例子：从相册选图，上传到 Cloudflare R2，复制固定 URL，再发布到 Markdown 博客。"
date: 2026-05-16
tags: ["Mobile", "Cloudflare", "R2"]
draft: false
---

有时候文章是在电脑前慢慢写出来的，有时候是在手机上顺手记下来的。手机端写博客最麻烦的地方通常不是文字，而是图片：相册里的截图、照片、临时配图，怎么变成一个能长期访问的 Markdown 图片地址？

现在这个博客的做法是：手机只负责准备图片和写 Markdown，图片统一上传到 Cloudflare R2，文章里引用固定 URL。

## 手机端的目标流程

一次完整发布可以拆成四步：

1. 在手机相册里选好图片。
2. 把图片传到电脑或远程开发环境。
3. 用项目里的上传命令把图片放进 R2。
4. 把命令输出的 Markdown 图片地址粘进文章。

这样做的好处是手机端不需要管理博客仓库里的图片目录，也不用把大图长期塞进 Git。文章里只保留类似这样的地址：

```md
![街边咖啡店门口的手写菜单](https://img.example.com/images/mobile-cafe-menu.jpg)
```

## 一个实际例子

假设手机里有一张照片，准备放进一篇生活记录里。先把图片命名成一个稳定、可读的文件名：

```txt
mobile-cafe-menu.jpg
```

如果用 iPhone，可以通过 AirDrop、iCloud Drive、Working Copy、Termius/SFTP 或其他文件同步工具，把图片放到电脑上的某个临时目录，例如：

```txt
~/Downloads/mobile-cafe-menu.jpg
```

然后在博客项目里上传到 R2：

```sh
R2_BUCKET=quiet-edge-images \
R2_PUBLIC_URL=https://img.example.com \
npm run upload:image -- ~/Downloads/mobile-cafe-menu.jpg images/mobile-cafe-menu.jpg
```

命令成功后会输出：

```md
![mobile cafe menu](https://img.example.com/images/mobile-cafe-menu.jpg)
```

把这行直接粘进手机上正在写的 Markdown 草稿就可以了。

## 手机上写文章

文章文件可以照着模板写：

```md
---
title: "周六下午的咖啡店"
description: "一段手机上写下的生活记录。"
date: 2026-05-16
tags: ["随笔", "生活"]
cover: "https://img.example.com/images/mobile-cafe-menu.jpg"
coverAlt: "街边咖啡店门口的手写菜单"
draft: false
---

下午路过一家小店，门口的菜单写得很随意，但看起来很舒服。

![街边咖啡店门口的手写菜单](https://img.example.com/images/mobile-cafe-menu.jpg)
```

如果手机上只是在记草稿，也可以先写成普通 Markdown，等回到电脑前再保存到：

```txt
src/content/posts/my-mobile-note.md
```

## 文件名约定

手机照片的原始文件名经常是 `IMG_1234.JPG` 之类的格式，不适合长期引用。上传前最好改成能看懂的 key：

```txt
images/2026-05-16-cafe-menu.jpg
images/mobile-r2-workflow-screenshot.jpg
images/travel-kyoto-station-night.jpg
```

建议只用小写英文、数字和连字符。这样以后在 R2 bucket 里搜索、替换、排查缓存都会轻松很多。

## 发布前检查

保存文章后，在项目里跑：

```sh
npm run verify
npm run build
```

确认构建通过，再提交推送。Cloudflare Pages 部署完成后，线上博客里就会出现这篇手机端写出来的文章。

## 小提醒

如果图片内容还可能修改，不要覆盖旧的 R2 object。换一个新文件名更稳，例如：

```txt
images/mobile-cafe-menu-v2.jpg
```

R2 图床适合保存“文章已经决定要引用”的图片。临时截图、还没筛选好的素材，可以先放在手机相册或云盘里，不急着上传。

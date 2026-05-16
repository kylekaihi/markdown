---
title: "手机快捷指令上传图片到 R2 图床"
description: "一步一步配置 iPhone 快捷指令：选择照片，上传到 Cloudflare Worker，自动复制 Markdown 图片链接。"
date: 2026-05-16
tags: ["iPhone", "Shortcuts", "R2"]
draft: false
---

前面已经把 R2 图床和 Worker 上传服务搭好了。现在只差手机上的最后一公里：打开快捷指令，选一张图片，然后自动拿到可以粘进博客文章的 Markdown 图片链接。

这篇只讲手机端怎么设置。照着做完以后，手机剪贴板里会出现这样的内容：

```md
![image](https://pub-dcceaf593d2f4e1b98340983af943fa0.r2.dev/images/2026-05-16-ab12cd34-image.jpg)
```

## 准备信息

当前上传服务已经部署好：

```txt
https://blog-image-uploader.shaokai-hi.workers.dev
```

上传口令不要写进公开文章。你需要在自己的快捷指令里填写私人口令：

```txt
<UPLOAD_TOKEN>
```

图片会被写入 R2 bucket `freetu`，最终公开地址会使用：

```txt
https://pub-dcceaf593d2f4e1b98340983af943fa0.r2.dev
```

## 新建快捷指令

在 iPhone 打开「快捷指令」App：

1. 点右上角 `+`。
2. 名字改成 `上传到 R2 图床`。
3. 点 `添加操作`。

接下来按顺序添加下面几个动作。

## 第一步：选择照片

添加动作：

```txt
选择照片
```

建议设置：

```txt
包含：图像
选择多项：关闭
```

先从单张图片开始，最不容易出错。等流程稳定后，再考虑多图上传。

## 第二步：转换图像

添加动作：

```txt
转换图像
```

设置：

```txt
输入：选择的照片
格式：JPEG
保留元数据：关闭
```

这一步很重要。iPhone 相册里的照片可能是 HEIC，直接传上去后有些浏览器或 Markdown 预览不一定显示得舒服。统一转成 JPEG，博客里最省心。

## 第三步：获取 URL 内容

添加动作：

```txt
获取 URL 内容
```

URL 填：

```txt
https://blog-image-uploader.shaokai-hi.workers.dev
```

展开高级设置后这样填：

```txt
方法：POST
请求正文：表单
```

添加一个表单字段：

```txt
键：file
类型：文件
值：转换后的图像
```

再添加请求标头：

```txt
Authorization: Bearer <UPLOAD_TOKEN>
```

注意 `Bearer` 后面有一个空格。

## 第四步：取出 Markdown 字段

Worker 返回的是 JSON，大概长这样：

```json
{
  "key": "images/2026-05-16-ab12cd34-image.jpg",
  "url": "https://pub-dcceaf593d2f4e1b98340983af943fa0.r2.dev/images/2026-05-16-ab12cd34-image.jpg",
  "markdown": "![image](https://pub-dcceaf593d2f4e1b98340983af943fa0.r2.dev/images/2026-05-16-ab12cd34-image.jpg)"
}
```

添加动作：

```txt
获取字典值
```

设置：

```txt
键：markdown
字典：URL 内容
```

这样就能只取出最终要粘贴进文章的 Markdown 图片语法。

## 第五步：复制到剪贴板

添加动作：

```txt
复制到剪贴板
```

输入选择上一步拿到的 `markdown`。

再加一个通知动作会更安心：

```txt
显示通知
```

通知文字可以写：

```txt
Markdown 图片链接已复制
```

## 使用方式

以后在手机上写博客时：

1. 打开快捷指令 `上传到 R2 图床`。
2. 从相册选一张图。
3. 等通知出现。
4. 打开 Markdown 草稿。
5. 粘贴。

粘贴出来的就是：

```md
![image](https://pub-dcceaf593d2f4e1b98340983af943fa0.r2.dev/images/2026-05-16-ab12cd34-image.jpg)
```

如果要把它设成文章封面，就放到 frontmatter：

```md
---
cover: "https://pub-dcceaf593d2f4e1b98340983af943fa0.r2.dev/images/2026-05-16-ab12cd34-image.jpg"
coverAlt: "图片说明"
---
```

## 常见问题

如果快捷指令提示 `Unauthorized`，先检查请求标头里的 `Authorization` 是否完整，特别是 `Bearer` 后面的空格。

如果提示 `Unsupported image type`，确认「转换图像」这一步的格式是 `JPEG`。

如果图片上传成功但文章里看不到，先把返回的 `url` 单独粘到 Safari 打开，确认 R2 公网地址可以访问。

如果以后想换成自己的图片域名，只要把 Worker 里的 `PUBLIC_BASE_URL` 改成新域名，快捷指令不用改。

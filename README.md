# Quiet Edge

A minimal Markdown blog built with Astro and deployed to Cloudflare Pages.

## Develop

```sh
npm install
npm run dev
```

## Build

```sh
npm run verify
npm run build
```

Markdown posts live in `src/content/posts`.

## Write A Post

Create a Markdown file in `src/content/posts`:

````md
---
title: "Post title"
description: "Short summary"
date: 2026-05-13
tags: ["Markdown", "Code"]
cover: "/images/example.svg"
coverAlt: "Cover image description"
draft: false
---

## Section

![Image caption](/images/example.svg)

```ts
const message = "Code blocks are highlighted and copyable";
```
````

Use `public/images` for local images. The `cover` and `coverAlt` fields are optional.

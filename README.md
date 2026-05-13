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

## Publish

The Cloudflare Pages project is connected to GitHub. Pushes to `main` trigger a production deployment automatically:

```sh
npm run verify
git add .
git commit -m "Update blog"
git push
```

## Write A Post

Copy the template outside the posts directory, then edit the new file:

```sh
cp templates/post-template.md src/content/posts/my-new-post.md
```

Each post should keep this structure:

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

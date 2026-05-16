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

## R2 Image Hosting

Use Cloudflare R2 as the blog image host: upload each image into an R2 bucket, expose the bucket through a fixed public URL, then paste that URL into Markdown posts.

Recommended production setup:

1. Create an R2 bucket in the same Cloudflare account as the Pages project.
2. In the bucket settings, connect a custom domain such as `img.example.com`. Cloudflare's `r2.dev` URL is useful for development, but a custom domain is the stable production option.
3. Authenticate Wrangler locally with `npx wrangler login`.
4. Set the bucket and public URL when uploading:

```sh
R2_BUCKET=quiet-edge-images \
R2_PUBLIC_URL=https://img.example.com \
npm run upload:image -- ./cover.jpg images/cover.jpg
```

The upload command writes the object to R2 with a long-lived `Cache-Control` header, then prints:

```md
![cover](https://img.example.com/images/cover.jpg)
```

Use that fixed URL in post frontmatter and body images:

```md
---
cover: "https://img.example.com/images/cover.jpg"
coverAlt: "Cover image description"
---

![Cover image description](https://img.example.com/images/cover.jpg)
```

If you omit the object key, the script uploads to `images/<filename>`. To change the default prefix, set `R2_PREFIX`, for example `R2_PREFIX=blog`.

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
cover: "https://img.example.com/images/example.jpg"
coverAlt: "Cover image description"
draft: false
---

## Section

![Image caption](https://img.example.com/images/example.jpg)

```ts
const message = "Code blocks are highlighted and copyable";
```
````

Use R2 fixed URLs for published images. `public/images` is still fine for temporary local assets. The `cover` and `coverAlt` fields are optional.

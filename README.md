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
npm test
npm run build
```

Markdown posts live in `src/content/posts`.

## Site Stats

The blog shows the current visitor time and a visit count near the top of every page. In production, create a Cloudflare KV namespace binding named `SITE_VISITS` for the Pages project so `/api/visit` can store the global count.

If the binding is not available, the page falls back to a browser-local counter so the static site still renders normally during local development.

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

### Mobile Shortcut Uploader

For phone-first writing, this repo also includes a Worker uploader in `worker/`. The iPhone Shortcut flow is:

1. Select Photos.
2. Convert Image to JPEG.
3. Send the image to the Worker with an `Authorization: Bearer <UPLOAD_TOKEN>` header.
4. Read the JSON field named `markdown`.
5. Copy that Markdown image link to the clipboard.

Configure the Worker:

```sh
npx wrangler secret put UPLOAD_TOKEN --config worker/wrangler.jsonc
```

Deploy it:

```sh
npm run deploy:uploader
```

The Worker writes the image to R2 and returns a Markdown link:

```md
![mobile cafe menu](https://pub-dcceaf593d2f4e1b98340983af943fa0.r2.dev/images/2026-05-16-ab12cd34-mobile-cafe-menu.jpg)
```

See `worker/README.md` for the full Shortcut setup.

Current Worker upload URL:

```txt
https://blog-image-uploader.shaokai-hi.workers.dev
```

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

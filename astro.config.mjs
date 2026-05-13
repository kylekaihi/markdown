import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://minimal-markdown-blog.pages.dev",
  output: "static",
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "github-light",
      wrap: false,
    },
  },
});

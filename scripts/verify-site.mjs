import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

const requiredFiles = [
  "package.json",
  "astro.config.mjs",
  "src/content/config.ts",
  "src/layouts/BaseLayout.astro",
  "src/pages/index.astro",
  "src/pages/posts/[slug].astro",
  "src/styles/global.css",
];

const fail = (message) => {
  console.error(`verify-site: ${message}`);
  process.exitCode = 1;
};

for (const file of requiredFiles) {
  try {
    const info = await stat(join(root, file));
    if (!info.isFile()) fail(`${file} is not a file`);
  } catch {
    fail(`${file} is missing`);
  }
}

const readRequired = async (file) => readFile(join(root, file), "utf8");

const contentConfig = await readRequired("src/content/config.ts");
for (const field of ["cover:", "coverAlt:"]) {
  if (!contentConfig.includes(field)) {
    fail(`content schema is missing ${field}`);
  }
}

const postTemplate = await readRequired("src/pages/posts/[slug].astro");
for (const marker of ["article-cover", "copy-code", "navigator.clipboard"]) {
  if (!postTemplate.includes(marker)) {
    fail(`post template is missing ${marker}`);
  }
}

const globalStyles = await readRequired("src/styles/global.css");
for (const selector of [".article-cover", ".prose figure", ".prose img", ".code-frame", ".copy-code"]) {
  if (!globalStyles.includes(selector)) {
    fail(`global styles are missing ${selector}`);
  }
}

const postsDir = join(root, "src/content/posts");
let posts = [];
try {
  posts = (await readdir(postsDir)).filter((file) => file.endsWith(".md"));
} catch {
  fail("src/content/posts is missing");
}

if (posts.length < 2) {
  fail("expected at least two sample Markdown posts");
}

for (const post of posts) {
  const text = await readFile(join(postsDir, post), "utf8");
  const frontmatter = text.match(/^---\n([\s\S]+?)\n---/);
  if (!frontmatter) {
    fail(`${post} is missing frontmatter`);
    continue;
  }

  for (const field of ["title:", "description:", "date:", "tags:", "draft:"]) {
    if (!frontmatter[1].includes(field)) {
      fail(`${post} frontmatter is missing ${field}`);
    }
  }

  const body = text.slice(frontmatter[0].length).trim();
  if (!body.includes("## ")) {
    fail(`${post} should include at least one second-level heading`);
  }
}

if (!process.exitCode) {
  console.log(`verify-site: ok (${posts.length} posts)`);
}

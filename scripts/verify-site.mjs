import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

const requiredFiles = [
  "package.json",
  "astro.config.mjs",
  "scripts/r2-upload-image.mjs",
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

const readRequired = async (file) => {
  try {
    return await readFile(join(root, file), "utf8");
  } catch {
    fail(`${file} could not be read`);
    return "";
  }
};

const packageJson = JSON.parse(await readRequired("package.json"));
if (packageJson.scripts?.["upload:image"] !== "node scripts/r2-upload-image.mjs") {
  fail("package.json is missing upload:image script");
}

const uploadScript = await readRequired("scripts/r2-upload-image.mjs");
for (const marker of ["R2_BUCKET", "R2_PUBLIC_URL", "wrangler r2 object put", "Cache-Control"]) {
  if (!uploadScript.includes(marker)) {
    fail(`R2 upload script is missing ${marker}`);
  }
}

const readme = await readRequired("README.md");
for (const marker of ["R2 Image Hosting", "R2_BUCKET", "R2_PUBLIC_URL", "npm run upload:image"]) {
  if (!readme.includes(marker)) {
    fail(`README is missing ${marker}`);
  }
}

const postTemplate = await readRequired("templates/post-template.md");
if (!postTemplate.includes("https://img.example.com/images/example.jpg")) {
  fail("post template should show an R2 fixed image URL");
}

const contentConfig = await readRequired("src/content/config.ts");
for (const field of ["cover:", "coverAlt:"]) {
  if (!contentConfig.includes(field)) {
    fail(`content schema is missing ${field}`);
  }
}

const postPage = await readRequired("src/pages/posts/[slug].astro");
for (const marker of ["article-cover", "copy-code", "navigator.clipboard"]) {
  if (!postPage.includes(marker)) {
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

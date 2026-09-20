import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve(import.meta.dirname, "../dist");
const indexPath = path.join(distDir, "index.html");
const notFoundPath = path.join(distDir, "404.html");

if (!fs.existsSync(indexPath)) {
  console.error("Error: dist/index.html does not exist. Run vite build first.");
  process.exit(1);
}

fs.copyFileSync(indexPath, notFoundPath);
console.log("✓ Copied dist/index.html to dist/404.html for GitHub Pages SPA routing");

# GitHub Pages Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure automated static site deployment to GitHub Pages with custom domain support, SPA client-side routing fallback (404.html), and GitHub Actions CI/CD pipeline.

**Architecture:** Build the Vite + React SPA into static assets, automatically duplicate `index.html` as `404.html` to support React Router deep links on GitHub Pages, configure base path flexibility via environment variables, and orchestrate automated deployments via GitHub Actions (`actions/deploy-pages`).

**Tech Stack:** Vite 8, React 19, React Router 8, pnpm, Node.js scripts, GitHub Actions (`upload-pages-artifact@v3`, `deploy-pages@v4`)

**Spec:** Deploy `shin-yxy-next` to GitHub Pages with custom domain URL mapping and full SPA client routing support.

## Global Constraints

- No breaking changes to existing 288 tests or build pipeline (`pnpm verify`).
- Pure static delivery without requiring any external Node.js runtime backend.
- Full React Router support for deep linking (`/login`, `/lab`, `/saved`) when refreshed on GitHub Pages.
- Support both root domain deployment (custom URL, e.g. `example.com`) and subpath deployment (default `username.github.io/repo/`).

---

### Task 1: SPA 404 Fallback Script for Client-Side Routing

GitHub Pages returns `404.html` when a requested subpath does not exist on disk. Duplicating `dist/index.html` to `dist/404.html` ensures React Router can boot and handle paths like `/lab` and `/saved` seamlessly without 404 errors.

**Files:**
- Create: `scripts/copy-404.mjs`
- Modify: `package.json:9`
- Test: `tests/scripts/copy-404.test.mjs` (or inline verification test)

**Interfaces:**
- Consumes: `dist/index.html` (produced by `vite build`)
- Produces: `dist/404.html` (identical content for GitHub Pages SPA routing fallback)

- [ ] **Step 1: Write test to verify copy-404 behavior**

Create `scripts/copy-404.test.mjs`:
```javascript
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";

const distDir = path.resolve("dist");
const indexPath = path.join(distDir, "index.html");
const notFoundPath = path.join(distDir, "404.html");

assert.ok(fs.existsSync(indexPath), "dist/index.html must exist before copy-404");
assert.ok(fs.existsSync(notFoundPath), "dist/404.html must exist after copy-404");

const indexContent = fs.readFileSync(indexPath, "utf-8");
const notFoundContent = fs.readFileSync(notFoundPath, "utf-8");
assert.strictEqual(indexContent, notFoundContent, "404.html content must match index.html");
console.log("✓ copy-404 verification passed");
```

- [ ] **Step 2: Run test to verify it fails before implementation**

Run: `node scripts/copy-404.test.mjs`
Expected: FAIL (assertion error or file not found)

- [ ] **Step 3: Implement `scripts/copy-404.mjs`**

Create `scripts/copy-404.mjs`:
```javascript
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
```

- [ ] **Step 4: Update `package.json` build script**

Modify `package.json` line 9:
```json
    "build": "tsc -b && vite build && node scripts/copy-404.mjs",
```

- [ ] **Step 5: Run build and verify test passes**

Run: `pnpm build && node scripts/copy-404.test.mjs`
Expected: PASS with "✓ Copied dist/index.html to dist/404.html" and "✓ copy-404 verification passed"

- [ ] **Step 6: Remove temporary test file and commit**

```bash
rm scripts/copy-404.test.mjs
git add scripts/copy-404.mjs package.json
git commit -m "feat(deploy): add 404.html generation for GitHub Pages SPA routing"
```

---

### Task 2: Base Path Configuration in Vite

Support flexible deployment environments: when deployed to a custom domain (e.g. `https://my-domain.com`), base path should be `/`; when deployed to a GitHub subpath (e.g. `https://<user>.github.io/<repo>/`), base path can be passed via `BASE_PATH` environment variable.

**Files:**
- Modify: `vite.config.ts:7-12`

**Interfaces:**
- Consumes: `process.env.BASE_PATH` (optional string)
- Produces: `base` property in Vite config

- [ ] **Step 1: Check existing `vite.config.ts`**

Inspect current `vite.config.ts` lines 7-12.

- [ ] **Step 2: Update `vite.config.ts` to support `BASE_PATH`**

Modify `vite.config.ts`:
```typescript
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  base: process.env.BASE_PATH || "/",
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  // d3 세 모듈로 506kB → 약 540kB. 분할은 4단계 이후 원장 항목
  build: { chunkSizeWarningLimit: 700 },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
```

- [ ] **Step 3: Verify build with default and custom base path**

Run:
```bash
pnpm build
BASE_PATH=/my-repo/ pnpm build
```
Check `dist/index.html` to confirm asset links adapt correctly.

- [ ] **Step 4: Commit**

```bash
git add vite.config.ts
git commit -m "feat(deploy): support BASE_PATH in vite config for flexible deployment"
```

---

### Task 3: GitHub Actions Deployment Workflow

Create `.github/workflows/deploy.yml` that triggers on push to the deployment branch, installs dependencies using `pnpm`, builds the project (including `404.html`), and uploads & deploys to GitHub Pages using official GitHub Actions.

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: Push to `main` (or user target branch)
- Produces: Live GitHub Pages deployment artifact

- [ ] **Step 1: Create directory `.github/workflows`**

Run: `mkdir -p .github/workflows`

- [ ] **Step 2: Write `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
      - phase-4-landing
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run verification (tests & typecheck)
        run: |
          pnpm typecheck
          pnpm test

      - name: Build site
        run: pnpm build

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "./dist"

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: Validate YAML syntax**

Run: `node -e "const fs = require('fs'); console.log('YAML exists:', fs.existsSync('.github/workflows/deploy.yml'));"`

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci(deploy): add GitHub Actions workflow for automated Pages deployment"
```

---

### Task 4: Deployment & Custom Domain DNS Setup Guide

Provide a comprehensive, step-by-step user guide for remote repository connection, GitHub Pages activation, DNS record configuration (A/CNAME), and SSL enforcement.

**Files:**
- Create: `docs/deployment-guide.md`

**Interfaces:**
- Consumes: Repository setup & user custom domain details
- Produces: Clear operational guide for repository owner

- [ ] **Step 1: Write `docs/deployment-guide.md`**

Include:
1. **GitHub Remote Connection**:
   - `git remote add origin https://github.com/<username>/<repo>.git`
   - `git push -u origin <branch>`
2. **GitHub Repository Settings**:
   - Navigate to `Settings` → `Pages`
   - Under **Build and deployment > Source**, select **GitHub Actions**
3. **Custom Domain (URL) Configuration**:
   - Under **Custom domain**, enter the purchased domain (e.g. `mysite.com` or `app.mysite.com`)
   - Click **Save**
4. **DNS Provider Settings (e.g., Gabia, Cloudflare, Namecheap)**:
   - For Apex Domain (`mysite.com`):
     - A records:
       - `185.199.108.153`
       - `185.199.109.153`
       - `185.199.110.153`
       - `185.199.111.153`
   - For Subdomain (`www.mysite.com` or `app.mysite.com`):
     - CNAME record pointing to `<username>.github.io`
5. **HTTPS Enforcement**:
   - Check **Enforce HTTPS** once DNS propagates.

- [ ] **Step 2: Commit**

```bash
git add docs/deployment-guide.md
git commit -m "docs: add GitHub Pages and custom domain deployment guide"
```

---

### Task 5: Full Pipeline Local Verification

Verify the entire build, test, and typecheck chain to ensure zero regression before push.

**Files:**
- None (verification only)

- [ ] **Step 1: Run full verification suite**

Run: `pnpm verify`
Expected: Typecheck passes, oxlint passes, vitest passes (288 tests), vite build passes with `dist/404.html` generated.

- [ ] **Step 2: Verify `dist` artifact contents**

Run: `ls -la dist/index.html dist/404.html`
Expected: Both files exist with identical sizes.

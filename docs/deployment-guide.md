# GitHub Pages & Custom Domain Deployment Guide

This guide details the complete process for deploying **shin-yxy-next** to GitHub Pages with automated CI/CD via GitHub Actions, configuring custom apex/subdomain DNS records, and enforcing SSL (HTTPS).

---

## Table of Contents

1. [GitHub Remote Connection](#1-github-remote-connection)
2. [GitHub Pages Configuration (GitHub Actions)](#2-github-pages-configuration-github-actions)
3. [Custom Domain Configuration](#3-custom-domain-configuration)
4. [DNS Provider Settings (A & CNAME Records)](#4-dns-provider-settings-a--cname-records)
5. [HTTPS (SSL) Enforcement & Verification](#5-https-ssl-enforcement--verification)
6. [Architecture & Troubleshooting](#6-architecture--troubleshooting)

---

## 1. GitHub Remote Connection

If this repository has not yet been linked to a GitHub remote repository, connect and push the local branches:

### Step 1.1: Create a GitHub Repository
1. Navigate to [github.com/new](https://github.com/new).
2. Set your repository name (e.g., `shin-yxy-next` or `<username>.github.io`).
3. Choose visibility (**Public** or **Private**; note that GitHub Pages on private repositories requires GitHub Pro, Team, or Enterprise).
4. Do not initialize with README, .gitignore, or license (the local repository already contains all files).

### Step 1.2: Add Remote and Push
In your local terminal inside the repository root:

```bash
# Add the remote origin (replace <username> and <repo> with your GitHub details)
git remote add origin https://github.com/<username>/<repo>.git

# Verify remote configuration
git remote -v

# Push your deployment branch (e.g. main or phase-4-landing)
git push -u origin <branch>
```

> **Note**: The `.github/workflows/deploy.yml` workflow triggers automatically on pushes to `main` and `phase-4-landing`. You can also trigger it manually from the **Actions** tab in GitHub (`workflow_dispatch`).

---

## 2. GitHub Pages Configuration (GitHub Actions)

Configure your repository to use GitHub Actions for deployment instead of the legacy `gh-pages` branch method.

1. Go to your repository on GitHub.
2. Click **Settings** (tab at the top).
3. In the left navigation sidebar, click **Pages** (under the "Code and automation" section).
4. Under **Build and deployment**:
   - **Source**: Select **GitHub Actions** from the dropdown.
5. Once selected, GitHub will automatically use the `.github/workflows/deploy.yml` workflow to build and deploy your site whenever changes are pushed to your deployment branch.

---

## 3. Custom Domain Configuration

To serve the application on your custom domain (e.g. `mysite.com`, `www.mysite.com`, or `app.mysite.com`):

1. On the same **Settings** → **Pages** screen:
2. Scroll down to the **Custom domain** section.
3. Enter your domain name:
   - Apex domain: `mysite.com`
   - Or Subdomain: `www.mysite.com` / `app.mysite.com`
4. Click **Save**.
5. GitHub will perform an initial DNS check and generate the required DNS instructions.

> **Tip**: If you configure an apex domain (`mysite.com`), you can also redirect `www.mysite.com` to `mysite.com` (or vice-versa) in GitHub Pages settings or through your DNS provider.

---

## 4. DNS Provider Settings (A & CNAME Records)

Log in to your DNS registrar or DNS management service (e.g. **Gabia**, **Cloudflare**, **Namecheap**, **Route 53**, **GoDaddy**). Add the appropriate DNS records based on whether you are using an apex domain or a subdomain.

### Option A: Apex Domain (`mysite.com`)

For an apex (root) domain, add four **A** records pointing to GitHub Pages' global IP addresses:

| Type | Host / Name | Target / Value | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` (or leave blank) | `185.199.108.153` | Automatic / 3600 |
| **A** | `@` (or leave blank) | `185.199.109.153` | Automatic / 3600 |
| **A** | `@` (or leave blank) | `185.199.110.153` | Automatic / 3600 |
| **A** | `@` (or leave blank) | `185.199.111.153` | Automatic / 3600 |

*(Optional)* You can also configure GitHub Pages IPv6 **AAAA** records for complete dual-stack coverage:
- `2606:50c0:8000::153`
- `2606:50c0:8001::153`
- `2606:50c0:8002::153`
- `2606:50c0:8003::153`

### Option B: Subdomain (`www.mysite.com` or `app.mysite.com`)

For subdomains, add a **CNAME** record pointing to your GitHub user/organization domain:

| Type | Host / Name | Target / Value | TTL |
| :--- | :--- | :--- | :--- |
| **CNAME** | `www` (or `app`) | `<username>.github.io` | Automatic / 3600 |

> **Example**: If your GitHub username is `octocat`, the target value should be `octocat.github.io`. Do not include a path or scheme like `https://`.

---

## 5. HTTPS (SSL) Enforcement & Verification

GitHub Pages automatically provisions a free Let's Encrypt TLS certificate for custom domains.

### Step 5.1: Wait for DNS Propagation
DNS changes may take anywhere from a few minutes to 24 hours to propagate globally. You can verify DNS propagation locally using `dig` or `nslookup`:

```bash
# Check Apex domain A records
dig +noall +answer mysite.com A
# Or nslookup
nslookup mysite.com

# Check Subdomain CNAME record
dig +noall +answer www.mysite.com CNAME
# Or nslookup
nslookup www.mysite.com
```

### Step 5.2: Enable "Enforce HTTPS"
1. Return to GitHub **Settings** → **Pages**.
2. Under **Custom domain**, observe the **DNS check** status.
3. Once the DNS status changes to verified/ready, check the box: **Enforce HTTPS**.
4. GitHub Pages will now redirect all insecure HTTP requests to secure HTTPS automatically.

---

## 6. Architecture & Troubleshooting

### SPA Client-Side Routing Fallback (`404.html`)
This project includes an automated script `scripts/copy-404.mjs` integrated into `pnpm build`.
- **Why it matters**: GitHub Pages serves static files. Direct navigation or refreshing subpaths like `/lab`, `/saved`, or `/login` triggers a 404 response on static hosts.
- **How it works**: When a 404 occurs, GitHub Pages serves `dist/404.html` (which is an exact copy of `dist/index.html`). React Router boots client-side, inspects `window.location.pathname`, and renders the requested view cleanly without error.

### Base Path (`BASE_PATH`)
- When deployed to a **custom domain** (`https://mysite.com`), Vite defaults `base: "/"` so all scripts and styles are resolved from the root domain.
- When deployed to a **GitHub repository subpath** (`https://<username>.github.io/<repo>/`), you can build with `BASE_PATH=/<repo>/ pnpm build`.

### Common Issues
1. **"DNS check unsuccessful" / "Unavailable for your site"**:
   - Verify that your DNS provider records match the table in Section 4.
   - Wait 15–30 minutes for TTL cache to expire.
2. **"Enforce HTTPS is unavailable" (Greyed out)**:
   - GitHub needs time to provision the Let's Encrypt certificate after DNS verification. This can take up to 15–60 minutes. Once provisioned, the checkbox becomes clickable.
3. **CAA Record Conflict**:
   - If your domain has CAA records configured, ensure they permit Let's Encrypt (`letsencrypt.org`) to issue certificates:
     `0 issue "letsencrypt.org"`

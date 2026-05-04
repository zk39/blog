---
title: "Migration Notes: From Vercel to GitHub + Cloudflare"
description: "Reorganizing my project infrastructure"
date: 2026-04-05
tags: ["frontend", "tools"]
---

# Migration Notes: From Vercel to GitHub + Cloudflare

## Background

My projects — personal homepage, blog, ARG game, and simulated OS page — were previously deployed on Vercel alongside a self-hosted server. As the number of projects grew, things started getting messy: static assets and backend logic were mixed together, and the server wasn't being used effectively.

I took this opportunity to reorganize the overall architecture and put everything in its proper place.

---

## The Core Idea

It's actually pretty simple:

> Hand static assets off to a CDN. The server only handles backend and data.

---

## What Changed

### 1. Frontend Migration

* All static projects moved to GitHub, deployed via Cloudflare Pages
* This includes:

  * Personal homepage
  * Blog
  * ARG game
  * Simulated OS page

The deployment workflow is now:

* Local development → push to GitHub → automatic build and deploy

No more manual uploads or maintaining server environments.

---

### 2. Homepage Rebuilt with Astro

* Homepage migrated to Astro
* Primarily static site generation (SSG)
* Minimal client-side JavaScript

Goals:

* Faster initial load
* Reduced unnecessary client-side rendering overhead
* Simple, maintainable structure

---

### 3. Domain and DNS

* Cloudflare handles all domain management and DNS
* Different projects use subdomains, for example:

  * `yourdomain.com` → homepage
  * `arg.yourdomain.com` → ARG game
  * `os.yourdomain.com` → simulated OS

---

### 4. Self-Hosted Server Refocused

The server previously handled both static assets and some backend functions. Now there's a clear separation.

Current uses only:

* Backend API (for future expansion)
* Data storage
* Project backups

No static pages deployed to it anymore.

---

## Current Architecture

```
[ GitHub + Cloudflare Pages ]
        ↓
   Static frontend (Blog / Home / ARG / OS)

[ Self-hosted server (Oracle Free Tier) ]
        ↓
   API / Data / Backups
```

---

## Reflections

The biggest change after this migration is that everything feels much simpler.

* Frontend deployment is nearly hands-off — push code and it's live
* No more dealing with Nginx configs or SSL certificates on the server
* The server can focus on what it's actually needed for

The overall architecture is also closer to a standard frontend/backend separation, which makes adding new features more natural.

---

## What's Next

* Add a simple backend API (possibly in Rust)
* Add a comment system to the blog
* Add progress saving or a leaderboard to the ARG game
* Set up an automated backup strategy

---

This migration wasn't complicated, but having a clean structure will make future development a lot easier.

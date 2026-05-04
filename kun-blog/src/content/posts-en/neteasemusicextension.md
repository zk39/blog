---
title: "NetEase Music Overseas Unlocker — Manifest V3"
description: "The original V2 extension stopped working, so I ported it to V3"
date: 2025-08-25
tags: ["extension", "frontend", "JS"]
---

# Porting the NetEase Music Overseas Unlocker to Manifest V3

If you use NetEase Music outside of China, you've probably come across [NetEaseMusicWorldPlus](https://github.com/nondanee/NetEaseMusicWorldPlus) — install it and regional restrictions disappear. It's been great.

But Chrome has been phasing out Manifest V2 extensions, and this one never got updated. It was only a matter of time before it got disabled. After waiting a while with no sign of anyone picking it up, I forked it and migrated it to V3 myself.

- Chrome Web Store: [NetEaseMusicWorldV3](https://chromewebstore.google.com/detail/neteasemusicworldv3/ppgcjokmjdmojbgdgggjehhmkpempmhf)
- GitHub: [zk39/NetEaseMusicWorldV3](https://github.com/zk39/NetEaseMusicWorldV3)

## Usage

Nothing complicated — install from the Chrome Web Store, log in to your NetEase Music account, and refresh the page. Login is required.

Click the extension icon to switch between three modes:

**Off**: Does nothing.

**Normal mode**: Uses `declarativeNetRequest` rules to inject an `X-Real-IP` header into requests to `music.163.com`, making it look like the request is coming from inside China to bypass regional checks.

**Enhanced mode**: Builds on normal mode by additionally injecting a script into the page that hooks XHR and rewrites CDN hostnames in responses from `m\d+.music.126.net` to `m\d+c.music.126.net`, pointing to domestic nodes. This solves the overseas CDN distribution issue without modifying your hosts file.

A page refresh is required after switching modes.

## What Changed from V2 to V3

The original extension used the `webRequest` API to intercept and modify request headers — a capability that was removed in V3. My changes mainly updated the API usage and ruleset format, replacing `webRequest` with declarative `declarativeNetRequest` rules that achieve the same effect. The enhanced mode inject script logic is mostly unchanged — it still hooks XHR to rewrite CDN addresses in responses.

## Notes

- You must be logged in to NetEase Music
- You may need to restart Chrome after first installation
- Always refresh the page after switching modes
- This relies on NetEase Music's page structure — a major frontend redesign on their end could break it

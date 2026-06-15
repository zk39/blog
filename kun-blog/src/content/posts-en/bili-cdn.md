---
title: "Speeding Up Bilibili Overseas: Hijacking playurl to Swap CDN Nodes"
description: "No proxy, no VPN — just replace the slow CDN node Bilibili assigned you, client-side."
date: 2026-06-15
tags: ["extension", "frontend", "JS"]
---

Slow video loading on Bilibili from overseas is a well-known problem. The usual fixes involve a proxy or VPN — both require changing your routing. But there's a lighter approach: Bilibili's video URL signatures don't bind to the hostname, so you can swap out the slow node entirely on the client side.

## Why Replacing the Domain Speeds Things Up

Bilibili assigns CDN nodes based on your real IP. Overseas users get routed to throttled international CDN nodes. The actual video files exist as copies across all of Bilibili's CDN mirrors — the only difference is which distribution path you take.

A Bilibili video segment URL looks like this:

```
https://upos-sz-mirrorcosov.bilivideo.com/upgcxcode/.../xxx.m4s?...&os=cosovbv&upsig=...&uparams=e,os,og,...
```

The key detail: `upsig` is computed only over the query parameters listed in `uparams` — **it does not include the hostname**. So you can swap the hostname between any `*.bilivideo.com` mirrors, keep the full path and query string intact, and the signature stays valid. That's the entire foundation this approach relies on.

One exception: `akamaized.net` Akamai nodes require their own `hdnts` token — switching to them gets you a 403. So replacements only happen within `*.bilivideo.com`.

## What Gets Intercepted

No APIs are replaced or called. What gets intercepted is Bilibili's own playback data, at three points:

**`window.__playinfo__`**: When you open a video page, the initial playback data is embedded directly in the HTML. The script uses `Object.defineProperty` to hijack this property and rewrites the domains before any page script reads it.

**Dynamic playurl requests**: When you switch quality, change episodes, or move to the next video, the player fetches:
- Regular videos (UGC): `api.bilibili.com/x/player/wbi/playurl`
- Anime/dramas (PGC): `api.bilibili.com/pgc/player/web/playurl`

The script hooks both `fetch` and `XMLHttpRequest`, matching these requests with `/\/playurl/` (the leading slash prevents false matches against `gen=playurlv3` in segment URLs — that was an actual bug at one point). Intercepted JSON responses get their CDN hostnames rewritten before being returned to the player.

The rewrite is uniform: serialize the JSON to a string, regex-replace all CDN hostnames, parse it back. `baseUrl`, `backupUrl`, `video`, `audio` — all covered in one pass.

```js
jsonStr.replace(
  /\/\/upos-[a-z0-9-]+\.(?:bilivideo\.com|akamaized\.net)\//g,
  `//${selectedHost}/`
)
```

## Where the CDN List Comes From

There's no official CDN list. The candidate list was assembled from three sources:

Bilibili nodes follow the pattern `upos-{region}-mirror{provider}.bilivideo.com`. Provider keywords were pulled from community projects — `cos` (Tencent), `ali` (Alibaba), `hw` (Huawei), `bos` (Baidu), `ks3` (Kingsoft), `kodo` (Qiniu) — and combined into candidates. References: [ipcjs/bilibili-helper](https://github.com/ipcjs/bilibili-helper/issues/737), [Bilibili Video CDN Switcher](https://greasyfork.org/en/scripts/500213-bilibili-video-cdn-switcher), [Make-Bilibili-Great-Than-Ever-Before](https://github.com/SukkaW/Make-Bilibili-Great-Than-Ever-Before).

Some candidates are guesses and need real-world validation. In my tests: `hwb`/`alib`/`08c` exist and are fast (5+ MB/s); `ks3`/`kodo` are dead domains; `akam` always 403s. The fastest node varies by network and time, which is why there's a built-in speed test panel rather than a hardcoded value.

## Extension Structure

Implemented as a Chrome extension rather than a userscript — it handles the cross-world communication issues more cleanly.

**`bili-cdn.js`** (`world: MAIN`, `document_start`): The core script. Needs to run in the page's JS environment to hijack `window.__playinfo__`, hook the page's `fetch`/XHR, and make same-origin requests to bilivideo during speed tests (for CORS to pass).

**`background.js`** (Service Worker): Toolbar icon clicks can only be listened to from the background. On click, it sends a message to the active tab.

**`bridge.js`** (standard isolated content script): MAIN world scripts can't access `chrome.runtime` and can't receive background messages. This bridge script receives messages and re-dispatches them as custom DOM events via `document.dispatchEvent`. The MAIN world panel listens for these events to toggle state.

**Settings in `localStorage`** (`bcdn_enabled`/`bcdn_mode`/`bcdn_host`/`bcdn_best`): MAIN world can't read `chrome.storage`, but localStorage is same-origin and synchronously readable — a clean way to share state across both worlds.

## The Speed Test Panel

Takes a real segment URL from the current `__playinfo__` at the highest available bitrate as the benchmark sample. Swaps in each candidate hostname in turn, streams the download via `fetch`, stops at 8 MB or 6 seconds, and calculates MB/s. Results are sorted and color-coded — green for fastest, red for failed or slow — with a "use this" button per row. Playback is automatically paused during the test to prevent the active stream from competing for bandwidth and skewing results.

---

The short version: intercept Bilibili's playback data (`__playinfo__` on page load + dynamic playurl responses), replace CDN hostnames in segment URLs with a faster `*.bilivideo.com` mirror, and rely on the fact that signatures don't cover the hostname to keep URLs valid.

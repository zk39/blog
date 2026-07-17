---
title: "Speeding Up Bilibili Overseas: Hijacking playurl to Swap CDN Nodes"
description: "No IP changes, no VPN. Just swap out the slow CDN node Bilibili assigned you, right in the browser."
date: 2026-06-15
tags: ["extension", "frontend", "JS"]
---

Slow video loading on Bilibili from overseas is a well-known problem. Recently Bilibili throttled things even harder, so I had enough and decided to do something about it. The usual fix is a proxy back to China, but that means changing your routing. There is actually a better way: Bilibili's video URL signatures do not bind to the hostname, so you can swap out the slow node right on the client side.

## Why Replacing the Domain Speeds Things Up

Bilibili assigns CDN nodes based on your real IP. Overseas users get routed to throttled international CDN nodes. The actual video files exist as copies across all of Bilibili's CDN mirrors, and the only difference is which distribution path you take.

A Bilibili video segment URL looks like this:

```
https://upos-sz-mirrorcosov.bilivideo.com/upgcxcode/.../xxx.m4s?...&os=cosovbv&upsig=...&uparams=e,os,og,...
```

The key detail: `upsig` is computed only over the query parameters listed in `uparams`, and **it does not include the hostname**. So you can swap the hostname between any `*.bilivideo.com` mirrors, keep the full path and query string intact, and the signature stays valid. That's the entire foundation this approach relies on.

One exception: `akamaized.net` Akamai nodes require their own `hdnts` token. Switching to them gets you a 403. So replacements only happen within `*.bilivideo.com`.

## What Gets Intercepted

No APIs are replaced or called. What gets intercepted is Bilibili's own playback data, at three points:

**`window.__playinfo__`**: When you open a video page, the initial playback data is embedded directly in the HTML. The script uses `Object.defineProperty` to hijack this property and rewrites the domains before any page script reads it.

**Dynamic playurl requests**: When you switch quality, change episodes, or move to the next video, the player fetches:
- Regular videos (UGC): `api.bilibili.com/x/player/wbi/playurl`
- Anime/dramas (PGC): `api.bilibili.com/pgc/player/web/playurl`

The script hooks both `fetch` and `XMLHttpRequest`, matching these requests with `/\/playurl/` (the leading slash prevents false matches against `gen=playurlv3` in segment URLs, which was an actual bug at one point). Intercepted JSON responses get their CDN hostnames rewritten before being returned to the player.

The rewrite is uniform: serialize the JSON to a string, regex-replace all CDN hostnames, parse it back. `baseUrl`, `backupUrl`, `video`, `audio`, all covered in one pass.

```js
jsonStr.replace(
  /\/\/upos-[a-z0-9-]+\.(?:bilivideo\.com|akamaized\.net)\//g,
  `//${selectedHost}/`
)
```

## Where the CDN List Comes From

There is obviously no official list for this kind of thing. By looking at community projects on GitHub, I found that Bilibili nodes all follow the pattern `upos-{region}-mirror{provider}.bilivideo.com`. I pulled the provider keywords (`cos`/`ali`/`hw`/`bos`, etc.) from community projects and assembled the candidate list from there. References: [ipcjs/bilibili-helper](https://github.com/ipcjs/bilibili-helper/issues/737), [Bilibili Video CDN Switcher](https://greasyfork.org/en/scripts/500213-bilibili-video-cdn-switcher), [Make-Bilibili-Great-Than-Ever-Before](https://github.com/SukkaW/Make-Bilibili-Great-Than-Ever-Before).

Some candidates are guesses and need real-world validation. In my tests: `hwb`/`alib`/`08c` exist and are fast (5+ MB/s); `ks3`/`kodo` are dead domains; `akam` always 403s. The fastest node varies by network and time, which is why there's a built-in speed test panel rather than a hardcoded value.

## Extension Structure

Implemented as a Chrome extension rather than a userscript, which handles the cross-world communication issues more cleanly.

**`bili-cdn.js`** (`world: MAIN`, `document_start`): The core script. Needs to run in the page's JS environment to hijack `window.__playinfo__`, hook the page's `fetch`/XHR, and make same-origin requests to bilivideo during speed tests (for CORS to pass).

**`background.js`** (Service Worker): Toolbar icon clicks can only be listened to from the background. On click, it sends a message to the active tab.

**`bridge.js`** (standard isolated content script): MAIN world scripts can't access `chrome.runtime` and can't receive background messages. This bridge script receives messages and re-dispatches them as custom DOM events via `document.dispatchEvent`. The MAIN world panel listens for these events to toggle state.

**Settings in `localStorage`** (`bcdn_enabled`/`bcdn_mode`/`bcdn_host`/`bcdn_best`): MAIN world can't read `chrome.storage`, but localStorage is same-origin and synchronously readable, which is a clean way to share state across both worlds.

## The Speed Test Panel

Takes a real segment URL from the current `__playinfo__` at the highest available bitrate as the benchmark sample. Swaps in each candidate hostname in turn, streams the download via `fetch`, stops at 8 MB or 6 seconds, and calculates MB/s. Results are sorted and color-coded (green for fastest, red for failed or slow), with a "use this" button per row. Playback is automatically paused during the test to prevent the active stream from competing for bandwidth and skewing results.

---

# *The approach is right, but the problem is not fully solved yet. Script injection might be slower than Bilibili's parsing speed. See the next post.*

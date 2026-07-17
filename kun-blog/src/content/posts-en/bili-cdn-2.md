---
title: "Bilibili CDN Speedup Part 2: The Timing Race and Why DNR Actually Fixed It"
description: "Why the script injection kept losing to Bilibili's inline data, and how the network layer solved it without relying on timing at all."
date: 2026-06-16
tags: ["extension", "frontend", "JS"]
---

The [first post](/posts/bili-cdn) hit a problem: the script injection sometimes lost to Bilibili's assignment speed, and the only fix was to manually refresh and hope for better timing. This post covers the fix.

## How Fast Bilibili Actually Is

Bilibili video pages are server-side rendered. By the time the browser gets the HTML, the playback data is already inline inside it:

```html
<script>window.__playinfo__ = { ...CDN URLs inside... }</script>
```

The browser parses HTML top to bottom. The moment it hits that inline `<script>` tag, it executes synchronously. `__playinfo__` gets assigned instantly, and the player reads it right away to start loading. No network request, no delay. It happens that fast.

To intercept it, you need to set up an `Object.defineProperty` setter on `window.__playinfo__` before that assignment runs. When the value gets set, your setter fires and rewrites the CDN domain. But that only works if your code runs before that inline script does.

## Why the Old Approach Always Lost

I carried the same approach over from the NetEase Music plugin. v1.0 used external file injection: a content script runs first, creates a `<script>` element pointing to `inject.js`, and the browser has to download that file, parse it, and execute it.

That whole chain is asynchronous. By the time `inject.js` actually runs, Bilibili's inline script has already finished. The setter gets set up too late, you lose the race, the video uses the original slow CDN node, and you have to refresh. When refreshing helped, it was just luck on the timing.

The short version: the time to download and execute an external file is longer than the time for the browser to reach that one inline script tag. That is why it was always slow.

## Switching to Synchronous Injection

The fix was to use `content_scripts` in the manifest with `world: "MAIN"` and `run_at: "document_start"`. This tells Chrome to inject the code directly and synchronously into the page context at the earliest possible moment, skipping the external file download entirely. The setter gets installed before HTML parsing even begins, so the odds of winning the race go way up.

But it is still a race. There is no 100% guarantee. In rare cases the timing still goes wrong. And if video segments are fetched inside a Web Worker, the hook on the main thread cannot see them at all. That is a blind spot the injection approach just cannot cover.

## The Network Layer: No Timing Required

The root problem with the race condition is that you cannot fully control which code runs first. The only real fix is to switch to a mechanism that does not depend on timing at all.

Google's Manifest V3 `declarativeNetRequest` works at the network layer. It redirects requests going to slow nodes straight to the fast node, with no involvement from JavaScript execution order. It does not care whether `__playinfo__` was intercepted, and it does not care whether segments are in a Worker. Any request that goes out gets rewritten. Always. No exceptions.

So even if the setter step fails completely, the actual segment requests still hit the fast node at the network layer.

This was actually the direction the [NetEase Music project](/posts/neteasemusicextension) deliberately avoided. That one only used DNR for header modification and handled CDN switching through script injection, because redirects can trigger CORS preflight issues. For Bilibili's media segment requests, that is not a problem, so this path works.

---

The logic of this extension comes down to three steps: external injection (always slow) then MAIN world synchronous injection (usually wins, but still a race) then adding DNR at the network layer (no timing dependency, problem solved).

## What It Cannot Fix

Because of how CDN caching works, videos from less popular creators can still buffer. If the video has not been cached on the node you are forcing, that node gets a cache miss and has to fetch the content from Bilibili's origin before it can serve it to you. In that case turning the extension off is actually faster.

Here is the project repo:

[zk39/bilibili-cdn-switcher](https://github.com/zk39/bilibili-cdn-switcher)

And the Chrome Extension:

[Bilibili CDN Speedup on Chrome Web Store](https://chromewebstore.google.com/detail/bilibilii-cdn%E5%8A%A0%E9%80%9F/kpjldkeakpnfeplfoofeklickdmakimn)

---
title: "B 站海外加速：为什么一直要刷新，以及怎么不用刷了"
description: "脚本注入和 B 站内联数据之间的时序竞速，以及网络层如何彻底绕开它。"
date: 2026-06-16
tags: ["插件", "前端", "JS"]
---

[上一篇](/posts/bili-cdn)末尾遇到问题：v1.0 的脚本注入有时候会输给 B 站的赋值速度，导致只能靠手动刷新碰运气。这篇讲解决方法。

## B 站那边有多快

B 站视频页是服务端渲染。浏览器拿到 HTML 的时候，首屏播放数据已经内联在里面了：

```html
<script>
	window.__playinfo__ = { ...含 CDN 地址... }
</script>
```

浏览器从上往下解析 HTML，读到这段内联 `<script>` 就同步执行，`__playinfo__` 瞬间被赋值，播放器紧接着读它开播。没有网络请求，没有延迟，就这么快。

要拦住它，唯一的办法是在这行赋值之前，先用 `Object.defineProperty` 在 `window.__playinfo__` 上装好一个 setter, 赋值时 setter 触发，在里面改掉 CDN 域名。但前提是：**代码需要比那行内联脚本更早跑起来**。

## 早期版本总是慢半拍

我沿用的网易云音乐插件的思路, v1.0 用的是"外部文件注入"：内容脚本先跑，然后 `createElement('script')` 指向 `inject.js`，浏览器还得去下载这个文件、解析、执行。

这整套是异步的。等 `inject.js` 真正跑起来，B 站那行内联脚本早就执行完了，setter 装晚了，视频就用了原始慢节点, 只能手动刷新，有时候刷了才好，是因为刷新偶尔碰巧抢赢了。

外部文件"下载 + 执行"的耗时，大于浏览器解析到那行内联脚本的耗时，所以慢。

## 改成同步注入，大概率可以赢

换成 manifest 的 `content_scripts` + `world: "MAIN"` + `run_at: "document_start"`，让 Chrome 在页面最早时机直接把代码同步注入页面上下文，省掉"下载外部文件"那段。这样 setter 能在 HTML 开始解析前就装好，抢赢的概率大大提高。

但它仍然是竞速，不是 100% 保证。极端情况还是可能晚半拍。而且如果分片在 Web Worker 里下载，主线程的钩子根本看不到，这是另一个盲区。

## 网络层：不靠抢时序

竞速问题的根子在于"谁先跑"，这件事本质上没办法完全控制。想彻底解决，就得换一个跟时序无关的机制。

谷歌manifest v3 的 `declarativeNetRequest` 在网络层工作，直接把发往慢节点的请求重定向到快节点。它不在乎 JS 跑到哪了，不管 `__playinfo__` 有没有被抢到，不管分片在不在 Worker 里, 只要请求发出来就拦截修改。

就算 setter 那一步完全没抢到，视频该发的分片请求在网络层还是会被改写到快节点。

这其实是我之前改过的[网易云那个项目](/posts/neteasemusicextension)特意没用的方向, 它只用 DNR 改请求头，CDN 替换靠脚本注入做，因为重定向会引发 CORS 预检问题。B 站的媒体分片请求没有这个限制，所以这条路通。

---

这个插件逻辑就三步：外部注入（总是慢）→ MAIN 世界同步注入（大概率赢，但仍是竞速）→ 加 DNR 网络层拦截（不靠抢时序，彻底绕开）。

## 解决不了的问题

因为cdn的回源机制,一些冷门 UP 的视频会卡, 是因为冷门 UP 的视频没被缓存在你强制的那个节点上,该节点收到请求时是缓存未命中,得回源(回 B 站原站去取)再吐给你, 这种情况关掉插件反而更快

最后贴一下项目地址

[zk39/bilibili-cdn-switcher](https://github.com/zk39/bilibili-cdn-switcher)

和Chrome Extension地址
[Bilibilii-CDN加速 - Chrome 应用商店](https://chromewebstore.google.com/detail/bilibilii-cdn%E5%8A%A0%E9%80%9F/kpjldkeakpnfeplfoofeklickdmakimn)

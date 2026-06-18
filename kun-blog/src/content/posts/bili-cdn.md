---
title: "B 站海外加速：劫持 playurl 换 CDN 节点"
description: "不改 IP、不翻墙，在客户端把 B 站分配给你的慢节点换掉。"
date: 2026-06-15
tags: ["插件", "前端", "JS"]
---

在海外看 B 站，视频加载慢是老问题。最近又限制了一次速度，常见解法要么是代理，要么是 VPN，都要改路由。但其实有个更轻的办法——B 站的视频地址签名不绑定主机名，可以在客户端直接把慢节点换掉。

## 灵感来源

其实两个之前的项目给了我线索。

一个是之前做的[网易云海外解锁插件](/posts/neteasemusicextension)——通过 hook XHR 把响应里的 CDN 域名从限速的海外节点改成国内节点，绕过大陆版权限制。手法完全一样：不动路由，只改域名。当时证明了这条路可行。

另一个是[B 站音频下载工具](/posts/bad)，做那个的时候发现视频页的 HTML 源码里直接塞着一个 `window.__playinfo__` 对象，视频的所有分片地址、码率、CDN 地址全都在里面，明文的。当时是用来拿音频流地址，但也意识到——既然源地址直接写在 info 里，改掉它不就行了？

两件事合在一起，这个项目就有了。

## 为什么换域名能提速

B 站根据你的真实 IP 判定地区，海外用户会被分配到限速的海外 CDN。视频文件本身在 B 站的各个 CDN 镜像上都有副本，节点之间只是分发线路不同。

B 站的分片地址长这样：

```
https://upos-sz-mirrorcosov.bilivideo.com/upgcxcode/.../xxx.m4s?...&os=cosovbv&upsig=...&uparams=e,os,og,...
```

关键在于 `upsig` 只对 `uparams` 里列出的 query 参数计算签名，**不含主机名**。所以在 `*.bilivideo.com` 各个 mirror 之间只换主机名、保留路径和 query，签名依然有效。这是整件事能成立的根本。

有一个例外：`akamaized.net` 的 Akamai 节点需要自己的 `hdnts` 令牌，换过去直接 403，所以只在 `*.bilivideo.com` 之间换。

## 拦截了什么

没有调用或替换任何 API，拦截的是 B 站自己的播放数据，一共三个点：

**`window.__playinfo__`**：打开视频页时，首屏播放数据直接内嵌在 HTML 里。脚本用 `Object.defineProperty` 劫持这个属性，赋值时改写域名，在页面脚本读取之前就替换完。

**playurl 接口的动态请求**：切清晰度、换 P、下一个视频时，播放器会发请求：
- 普通视频（UGC）：`api.bilibili.com/x/player/wbi/playurl`
- 番剧/影视（PGC）：`api.bilibili.com/pgc/player/web/playurl`

脚本 hook 了 `fetch` 和 `XMLHttpRequest`，用 `/\/playurl/` 匹配这些请求（`playurl` 前面要求是斜杠，避免误伤分片地址里 `gen=playurlv3` 那个子串），拦下返回的 JSON 改写域名。

改写方式很统一：把 JSON 转字符串，正则替换所有 CDN 主机名，再解析回对象。`baseUrl`、`backupUrl`、`video`、`audio` 一次性全覆盖。

```js
jsonStr.replace(
  /\/\/upos-[a-z0-9-]+\.(?:bilivideo\.com|akamaized\.net)\//g,
  `//${selectedHost}/`
)
```

## CDN 列表从哪来

没有官方清单。B 站节点统一是 `upos-{地区}-mirror{服务商}.bilivideo.com` 格式，服务商关键字（`cos`/`ali`/`hw`/`bos` 等）从社区项目里拿的，参考了 [ipcjs/bilibili-helper](https://github.com/ipcjs/bilibili-helper/issues/737)、[Bilibili Video CDN Switcher](https://greasyfork.org/en/scripts/500213-bilibili-video-cdn-switcher)、[Make-Bilibili-Great-Than-Ever-Before](https://github.com/SukkaW/Make-Bilibili-Great-Than-Ever-Before)，拼出候选列表。

候选里有些是猜的，实测结果：`hwb`/`alib`/`08c` 快（5+ MB/s），`ks3`/`kodo` 是死域名，`akam` 必 403。不同网络时间最快节点会变，所以内置测速面板，不写死一个。

## 扩展结构

用 Chrome 扩展实现 

**`bili-cdn.js`**（`world: MAIN`，`document_start`）：核心脚本。必须在页面 JS 环境里跑，才能劫持 `window.__playinfo__`、hook 页面的 `fetch`/XHR，以及测速时同源访问 bilivideo（CORS 才能过）。

**`background.js`**（Service Worker）：工具栏图标点击只能在后台监听，点击后给当前标签页发消息。

**`bridge.js`**（普通 isolated 内容脚本）：MAIN 世界拿不到 `chrome.runtime`，收不到后台消息。这个桥接脚本接收消息后用 `document.dispatchEvent` 派发自定义 DOM 事件，MAIN 世界的面板监听这个事件来开关。

**设置存 `localStorage`**（`bcdn_enabled`/`bcdn_mode`/`bcdn_host`/`bcdn_best`）：MAIN 世界读不到 `chrome.storage`，localStorage 同源可同步读取，正好跨两个世界共享状态。

## 测速面板

从当前 `__playinfo__` 取最高码率的真实分片地址当样本，主机名依次换成每个候选节点，`fetch` 流式下载，下够 8 MB 或超 6 秒就停，算出 MB/s。结果排序，绿色最快，红色失败或慢，每行可直接「选用」。测速时自动暂停视频，避免播放拉流抢带宽影响结果。

# *思路正确, 但问题至此还没有完全解决 因为脚本注入执行速度可能会比B站解析速度慢, 请见下一篇*
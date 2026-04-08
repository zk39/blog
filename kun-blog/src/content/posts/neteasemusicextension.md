---
title: "网易云海外解锁插件 Manifest V3 版"
description: "原版 V2 插件不能用了，改了个 V3 的"
date: 2025-08-25
tags: ["插件", "前端", "JS"]
---

# 把网易云海外解锁插件改成了 Manifest V3

在海外听网易云的应该都知道 [NetEaseMusicWorldPlus](https://github.com/nondanee/NetEaseMusicWorldPlus) 这个插件，装上就能解锁地区限制，挺好用的。

但 Chrome 从去年开始逐步淘汰 Manifest V2 扩展，这个插件一直没更新，迟早要被禁用。等了一阵没人动手，就自己 fork 过来改成了 V3。

- Chrome 商店：[NetEaseMusicWorldV3](https://chromewebstore.google.com/detail/neteasemusicworldv3/ppgcjokmjdmojbgdgggjehhmkpempmhf)
- GitHub：[zk39/NetEaseMusicWorldV3](https://github.com/zk39/NetEaseMusicWorldV3)

## 用法

没什么复杂的，Chrome 商店装完，登录网易云账号，刷新页面就行。必须登录才能用。

点击插件图标可以切换三种模式：

**关闭**：啥也不干。

**普通模式**：通过 `declarativeNetRequest` 规则给发往 `music.163.com` 的请求加上 `X-Real-IP` 头，伪装成国内 IP，骗过网易云的地区检测。

**增强模式**：在普通模式的基础上，额外往页面注入脚本，hook XHR 把响应里的 CDN 域名从 `m\d+.music.126.net` 改成 `m\d+c.music.126.net`，指向国内节点，解决海外 CDN 分发问题。不用改 hosts。

切换模式后要刷新页面才生效。

## V2 → V3 改了什么

原版用 `webRequest` API 拦截请求、修改请求头，V3 里这个能力被砍了。我这边主要更新了 V3 API 适配和 ruleset 格式，用 `declarativeNetRequest` 以声明式规则的方式实现同样的效果。增强模式的 inject script 逻辑基本没动，还是 hook XHR 改响应里的 CDN 地址。

## 注意

- 必须登录网易云账号
- 首次装完可能要重启一下 Chrome
- 切换模式后要刷新页面
- 本质上是依赖网易云的页面结构，如果官方大改可能会失效

---
title: "b站视频转音频"
description: "cli下载工具"
date: 2026-02-20
tags: ["前端", "工具","命令行","npm"]
---

# 写了个 B 站视频转音频的小工具

平时在 B 站听翻唱、长音频之类的，想存下来当音频听，试了几个工具都不太顺手，就自己用 Node 写了一个 CLI

- GitHub: https://github.com/zk39/BiliAudioDownloader
- npm: https://www.npmjs.com/package/bili-audio-downloader

## 干嘛的

把 B 站视频的音频轨提出来，转成 mp3 / flac 这些格式。支持单个视频和合集批量下载。

```bash
bili-audio-downloader https://www.bilibili.com/video/BVxxxx
```

## 为什么不用 yt-dlp

试过，但要装 Python 和一堆依赖，参数也多，B 站的 cookie、音质这些还得自己折腾。我就想要一个 `npm install -g` 完事直接用的东西。

## 大概流程

请求视频页面 → 从 HTML 里扒 `window.__playinfo__` → 找音频流 → 选最高码率 → 下载 → ffmpeg 转格式。就这么几步。
在科研的时候也考虑过调官方API，但还是选了我认为比较简单的办法，扒页面分析

## 一些细节

**音频流选择**：B 站返回多条音频流带码率，直接排序取最大的。

**URL fallback**：主 URL 偶尔会挂，所以 baseUrl 和 backupUrl 都收集起来挨个试。

**格式转换**：先下成 m4a，再用 ffmpeg 转目标格式为mp3，不转的话虽然是m4s但还是视频格式，老设备读不出。

**Cookie**：需要高码率音频，做了手动输入 + 本地保存 + 下次自动加载，不优雅但能用。

**合集下载**：通过 `/x/polymer/web-space/seasons_archives_list` 分页拿数据，做了个简单的预览菜单，看完再决定下不下。

**并发**：用 p-limit 控制（默认 3 个），配 cli-progress 做多进度条，不会太慢也不会被限流。

## 用到的东西

Node.js / TypeScript、axios、ffmpeg-static、cli-progress、p-limit、readline，没用什么重框架。

## 安装

```bash
npm install -g bili-audio-downloader
```

## 已知问题

- 依赖 B 站页面结构，改了就得跟着修
- cookie 要自己弄
- ffmpeg 算是个外部依赖

## 后续可能做的

- 自动读浏览器 cookie
- 补 metadata（封面、标题）
- 简单 GUI（可能用 Tauri）

项目不复杂，但 B 站接口处理、音频流 fallback、CLI 交互这些细节还是花了点时间。有类似需求的可以试试。

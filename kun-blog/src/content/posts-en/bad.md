---
title: "Bilibili Video to Audio Downloader"
description: "A CLI tool to extract and download audio from Bilibili videos"
date: 2026-02-20
tags: ["frontend", "tools", "cli", "npm"]
---

# I Built a CLI Tool to Download Audio from Bilibili

I often listen to covers and long-form audio on Bilibili and wanted to save them as audio files locally. After trying a few existing tools that didn't quite fit my workflow, I wrote my own CLI tool in Node.js.

- GitHub: https://github.com/zk39/BiliAudioDownloader
- npm: https://www.npmjs.com/package/bili-audio-downloader

## What It Does

Extracts the audio track from a Bilibili video and converts it to formats like mp3 or flac. Supports both single videos and batch downloading from playlists.

```bash
bili-audio-downloader https://www.bilibili.com/video/BVxxxx
```

## Why Not Just Use yt-dlp?

I tried it, but it requires Python and a bunch of dependencies, has a lot of flags to configure, and getting Bilibili cookies and audio quality right still takes manual effort. I wanted something where `npm install -g` is all you need.

## How It Works

Request the video page → scrape `window.__playinfo__` from the HTML → find the audio stream → pick the highest bitrate → download → convert with ffmpeg. That's basically it. I considered using the official API but went with page scraping as the simpler path.

## Implementation Details

**Audio stream selection**: Bilibili returns multiple audio streams with different bitrates. I sort them and take the highest.

**URL fallback**: The primary URL occasionally fails, so both `baseUrl` and `backupUrl` are collected and tried in sequence.

**Format conversion**: The raw download is an m4a file, which gets converted to the target format (e.g. mp3) via ffmpeg. Without conversion, older devices can't read it even though the container is technically audio.

**Cookie handling**: High-bitrate audio requires authentication. I implemented manual cookie input with local storage and auto-loading on subsequent runs — not elegant, but it works.

**Playlist downloading**: Uses the `/x/polymer/web-space/seasons_archives_list` endpoint with pagination. A preview menu is shown before downloading so you can decide what to grab.

**Concurrency**: Controlled with `p-limit` (default: 3 concurrent downloads), paired with `cli-progress` for multi-bar progress display. Fast enough without hitting rate limits.

## Stack

Node.js / TypeScript, axios, ffmpeg-static, cli-progress, p-limit, readline. No heavy frameworks.

## Installation

```bash
npm install -g bili-audio-downloader
```

## Known Issues

- Depends on Bilibili's page structure — breaks if they change it
- Cookie setup is manual
- ffmpeg is an external dependency

## Possible Future Work

- Auto-read cookies from the browser
- Embed metadata (cover art, title)
- Simple GUI (maybe with Tauri)

The project itself isn't complex, but the Bilibili API handling, audio stream fallback logic, and CLI interaction took some time to get right. Give it a try if you have similar needs.

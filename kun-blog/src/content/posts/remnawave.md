---
title: "用 Remnawave 统一管理 6 台 VPS 节点"
description: "从人手一个 UUID 到每人独立订阅和流量统计，踩了一路坑。"
date: 2026-06-17
tags: ["运维", "工具", "自建"]
---

起因很简单：6 台 VPS，每台手动搭了 Xray，几个合租的朋友共用同一个 UUID。用了挺长时间，但一直没办法知道谁用了多少流量，也没办法单独控制某个人的权限。忍了一阵，决定上面板统一管理。

选了 [Remnawave](https://remnawave.com)，主要是它的 Panel + Node 分离架构比较干净，而且支持每个用户独立 UUID 和订阅。

## 架构

搞清楚架构是第一步，不然很多概念会混。

**Panel** 单独跑在一台机器上，docker compose 部署，本身不跑 Xray，只负责管理配置和用户。**Node** 装在每台落地 VPS 上，一个容器（remnanode），从面板拉配置、跑 Xray、上报流量。两者通过加密端口（默认 20000）通信。

配置层面：维护一份全局 Xray JSON，所有节点的 inbound 都写在里面，每个 inbound 有唯一 `tag`。每台 Node 在面板里只勾选属于自己的 tag，只跑自己那部分。

用户层面是三层关系：**inbound**（流量入口）→ **Host**（把 inbound 发布出去，生成订阅链接）→ **Internal Squad**（用户组，决定哪个用户能看到哪些 Host）。用户必须属于含目标 Host 的 Squad，否则订阅返回空。这个逻辑绕，但理顺一遍之后改起来很快。

<img src="/assets/remnawave_sc_1.png" alt="Remnawave 面板总览" style="width:100%;border-radius:8px;margin:24px 0;" />

上图是接入完成后面板的状态，6 台节点全在线，累计流量、实时速率都在这里看。

## 两种密钥，必须分清

这是最容易搞混的地方。

**节点密钥**（环境变量 `SECRET_KEY`）：让 Node 和 Panel 互相认证、建立连接用的。面板创建节点时自动生成，填到 Node 的 docker-compose 里。

**REALITY 私钥**（X25519 密钥对）：让客户端和节点做握手认证用的。用 `docker exec -it remnanode xray x25519` 生成，填在配置 JSON 的 `privateKey` 字段。可以多节点共用一个，公钥由面板自动算出来下发给客户端。

两个密钥完全独立，和 dest / SNI 也没关系。REALITY 的 dest 是借大厂证书做流量伪装，私钥是协议自己用来区分自己人与探测者的，是两件事。

## 踩的坑

**sing-box 不支持 VMess 入站**。有台节点核心跑的是 sing-box，直接把原来的 VMess inbound 贴进去报错。直接删掉 2 个遗留 VMess，只保留 VLESS，解决。

**端口冲突**。从旧节点迁移的机器，旧 Xray 还在宿主机上跑着占着端口，新容器起不来，报 `bind: address already in use`。`ss -tlnp | grep <端口>` 找到占用进程，`systemctl stop` 停掉，重启容器就好。

**tag 没勾导致端口不监听**。配置里写了 inbound 不等于节点会跑，必须在面板里勾上对应 tag 才会下发。这个反复踩，后来养成习惯：贴完配置 → 勾 tag → 重启 → `ss` 确认端口。

**订阅返回空**。订阅链接里全是占位提示（No hosts found / Check Hosts / Check Internal Squads），原因是 Host 没建，或者用户没放进含 Host 的 Squad 里。

**Oracle 双层防火墙**。Oracle VPS 有两层防火墙：云控制台的 Security List 和机器内的 iptables（Oracle 镜像默认开启，优先级高于 ufw）。症状是本机 `curl 127.0.0.1:port` 通，面板连不上（EHOSTUNREACH / timeout）。两层都要放行业务端口和 20000。

**节点 IP 填错一位**。面板里节点地址少打了一个数字，面板一直 timeout。后来摸出来一个规律：timeout 一般是连错地址或被静默丢弃；密钥错会报认证失败，不是 timeout。

**Cloudflare 规则选错**。想让面板域名不带端口访问，用了 Redirect Rule（301 跳转），结果不对。应该用 Origin Rule——只改 CF 回源端口，对访客 URL 透明。另外铁律：只有面板域名开橙云代理，节点域名必须灰云直连，REALITY 和真 TLS 过不了 CF 代理。

## TLS 证书自动续期

有 2 台绑了自有域名、走真 TLS 的节点，这里有个坑值得单独说。

证书要挂进容器，直接在 docker-compose 里用 volume 把证书目录挂进去，容器内路径对应配置里的 `certificateFile` / `keyFile`。不要用软链接——容器看不到软链接目标。

acme.sh 默认续期只更新自己的工作目录，不会自动把新证书送到容器用的路径，结果就是节点拿着过期证书直到挂掉。解法是用 `--install-cert` 把搬运规则永久写进 acme.sh：

```bash
acme.sh --install-cert -d 你的域名 --ecc \
  --fullchain-file /节点证书目录/fullchain.pem \
  --key-file /节点证书目录/key.pem \
  --reloadcmd "sudo docker restart 容器名"
```

此后每次续期：自动把新证书复制到容器目录 → 执行 reloadcmd 重启容器。acme.sh 自带 cron 负责何时续，这条命令负责续完怎么处理。跑完看日志出现 `Installing full chain` + `Running reload cmd` + `Reload successful` 就算配好了。

另外 acme.sh 装在普通用户下，不要用 sudo 跑它，只有 reloadcmd 里的 docker restart 需要免密 sudo。

## 结果

<img src="/assets/remnawave_sc_2.png" alt="用户列表，每人独立状态" style="width:100%;border-radius:8px;margin:24px 0;" />

6 台全接进来，每个朋友独立 UUID + 独立订阅，流量各自统计，TLS 续期也不用管了。相比之前人手一个 UUID 的状态，好用很多。

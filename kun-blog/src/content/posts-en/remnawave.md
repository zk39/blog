---
title: "Managing 6 VPS Nodes with Remnawave"
description: "From one shared UUID for everyone to separate subscriptions and traffic stats per user — and all the problems along the way."
date: 2026-06-17
tags: ["ops", "tools", "self-hosted"]
---

The problem was simple: 6 VPS servers, each running Xray manually, all sharing the same UUID with a few friends. It worked fine for a while, but there was no way to see who used how much traffic, or to cut off one person's access without affecting everyone else. I put up with it for a while, then decided to set up a proper management panel.

I went with [Remnawave](https://remnawave.com). The main reason is its clean Panel + Node architecture, and the fact that it gives each user their own UUID and subscription link.

## How It Works

Understanding the architecture first saves a lot of confusion later.

The **Panel** runs on one dedicated server (deployed with docker compose). It doesn't run Xray itself — it just manages config and users. Each VPS runs a **Node** container (remnanode), which pulls config from the Panel, runs Xray, and reports traffic back. The two talk to each other over an encrypted port (default: 20000).

On the config side: there's one global Xray JSON file. Every node's inbound is listed in this file, each with a unique `tag`. In the Panel, each Node only picks the tags that belong to it, so it only runs its own part of the config.

On the user side, there are three layers: **inbound** (the traffic entry point) → **Host** (publishes an inbound and creates a subscription link) → **Internal Squad** (a user group that controls which Hosts a user can see). If a user isn't in a Squad that contains the right Host, their subscription will be empty. This logic is a bit confusing at first, but once you understand it, making changes is fast.

<img src="/assets/remnawave_sc_1.png" alt="Remnawave dashboard overview" style="width:100%;border-radius:8px;margin:24px 0;" />

The screenshot above shows the Panel after everything was connected — all 6 nodes online, total traffic and live speeds all in one place.

## Two Keys — Don't Mix Them Up

This is the most common source of confusion.

**Node key** (environment variable `SECRET_KEY`): Used for the Node and Panel to authenticate each other and connect. The Panel generates this automatically when you create a node. You paste it into the Node's docker-compose file.

**REALITY private key** (X25519 key pair): Used for the client and node to do a handshake. Generate it with `docker exec -it remnanode xray x25519` and put it in the `privateKey` field of your config JSON. Multiple nodes can share one key. The Panel calculates the public key automatically and sends it to clients.

These two keys have nothing to do with each other, and neither is related to `dest` or `SNI`. The REALITY `dest` is just a big website's domain used as a disguise for traffic. The private key is what lets the node tell apart real users from network scanners. Two completely separate things.

## Problems I Hit

**sing-box doesn't support VMess inbound.** One of my nodes was running sing-box as its core. When I pasted in the old VMess inbound config, it threw an error. I just deleted the 2 leftover VMess inbounds and kept only VLESS. Problem gone.

**Port conflict.** On machines migrated from old nodes, the old Xray was still running on the host and holding the port. The new container wouldn't start — `bind: address already in use`. Use `ss -tlnp | grep <port>` to find what's using it, `systemctl stop` to stop it, then restart the container.

**Tag not selected → port not listening.** Writing an inbound in the config doesn't mean the node will actually run it. You have to check the tag in the Panel for it to get pushed down. I kept forgetting this. Eventually I made it a habit: paste config → check tag → restart → `ss` to confirm the port is open.

**Subscription returns empty.** The subscription link just shows placeholder messages (No hosts found / Check Hosts / Check Internal Squads). Cause: either the Host wasn't created, or the user wasn't added to a Squad that contains that Host.

**Oracle's two-layer firewall.** Oracle VPS has two separate firewalls: the Security List in the cloud console, and iptables inside the machine (Oracle's default image enables this, and it has higher priority than ufw). The symptom: `curl 127.0.0.1:port` works locally but the Panel can't connect (EHOSTUNREACH / timeout). You need to open the ports in both layers — business ports plus 20000.

**Typed the node IP wrong.** I missed one digit in the node's IP address in the Panel. It kept timing out. I later figured out a useful pattern: timeout usually means the wrong address or packets being silently dropped; a wrong key gives an authentication error, not a timeout.

**Wrong Cloudflare rule type.** I wanted the Panel domain to work without a port number in the URL. I used a Redirect Rule (301 redirect) — wrong. The right tool is an Origin Rule, which only changes what port Cloudflare connects to on the backend, without touching the URL the visitor sees. Also: only the Panel domain should go through Cloudflare's proxy (orange cloud). Node domains must be DNS-only (grey cloud). REALITY and real TLS don't work through CF's proxy.

## TLS Certificate Auto-Renewal

Two of my nodes use real TLS with custom domains. There's one tricky part worth explaining.

The certificate needs to be mounted into the container. In docker-compose, use a volume to mount the certificate folder into the container, and point `certificateFile` / `keyFile` in your config to the paths inside the container. Don't use symlinks — the container can't see where they point.

By default, acme.sh only updates its own working directory when it renews. It doesn't copy the new certificate to wherever the container is reading from. So the node keeps using the old certificate until it expires. The fix is to use `--install-cert` to permanently tell acme.sh what to do after each renewal:

```bash
acme.sh --install-cert -d your-domain --ecc \
  --fullchain-file /path/to/node/certs/fullchain.pem \
  --key-file /path/to/node/certs/key.pem \
  --reloadcmd "sudo docker restart container-name"
```

After this, every time the cert renews: acme.sh copies the new cert to the container's folder → runs the reloadcmd to restart the container. acme.sh's built-in cron job handles when to renew; this command handles what to do after. You know it's working when the log shows `Installing full chain` + `Running reload cmd` + `Reload successful`.

One more thing: acme.sh is installed as a regular user — don't run it with sudo. Only the `docker restart` inside reloadcmd needs passwordless sudo.

## Result

<img src="/assets/remnawave_sc_2.png" alt="User list with individual status" style="width:100%;border-radius:8px;margin:24px 0;" />

All 6 servers connected to one panel. Each friend has their own UUID and subscription link, traffic tracked separately, TLS renewal runs on its own. A big improvement over everyone sharing one UUID.

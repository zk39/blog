---
title: "Managing My 6 VPS Nodes with Remnawave"
description: "From one shared UUID for everyone to separate subscriptions and traffic stats per user, and all the problems I ran into along the way."
date: 2026-06-17
tags: ["ops", "tools", "self-hosted"]
---

The reason I started using a panel is pretty simple. I personally own 6 budget VPS servers, each running Xray set up manually, all shared with a few friends using the same UUID. It was convenient when I first set it up, but there was never any way to see who used how much traffic, or to know if someone had shared the config link with their friends. No way to limit one person's access without affecting everyone else either. I put up with it for a while, then decided I had suffered enough and set up a proper management panel.

I went with [Remnawave](https://remnawave.com). The main reason is the clean Panel plus Node separation architecture (and the monitoring UI actually looks quite nice), plus it gives every user their own UUID and subscription link.

## How It Works

Getting the architecture straight is the first step. Without that, everything feels confusing.

The **Panel** runs as the control center on one dedicated machine, deployed with docker compose. It does not run Xray itself. It just manages config and users. Each VPS runs a **Node** container (remnanode) that pulls config from the Panel, runs Xray, and reports traffic back. The two communicate over an encrypted port (default 20000).

On the config side: you maintain one global Xray JSON file. Every node's inbound is written in this one file, each with a unique `tag`. In the Panel, each Node picks only the tags that belong to it, so it only runs its own part of the config.

On the user side, there are three layers: **inbound** (the traffic entry point), then **Host** (publishes an inbound and generates a subscription link), then **Internal Squad** (a user group that controls which Hosts a user can see). A user has to belong to a Squad that contains the right Host, otherwise their subscription comes back empty.

<img src="/assets/remnawave_sc_1.png" alt="Remnawave dashboard overview" style="width:100%;border-radius:8px;margin:24px 0;" />

The screenshot above shows the Panel after everything was connected. All 6 nodes are online, total traffic and live speeds all in one place.

## Two Keys

This is the part that is easiest to mix up during setup.

**Node key** (environment variable `SECRET_KEY`): Used for the Node and Panel to authenticate each other and establish a connection. The Panel generates this automatically when you create a node entry. You paste it into the Node's docker-compose file.

**REALITY private key** (X25519 key pair): Used for the client and node to do a handshake. Generate it with `docker exec -it remnanode xray x25519` and put it in the `privateKey` field of your config JSON. Multiple nodes can share one key pair. The Panel calculates the public key automatically and pushes it to clients.

These two keys are completely independent from each other, and neither has anything to do with `dest` or `SNI`. The REALITY `dest` is just a big site's domain used to disguise your traffic. The private key is what lets the node tell apart real users from network scanners. Two completely separate things.

## Problems I Hit

**sing-box does not support VMess inbound.** One of my nodes was running sing-box as its core. When I pasted in the old VMess inbound config it threw an error. I just deleted the 2 leftover VMess inbounds and switched them to VLESS. Problem gone.

**Port conflict.** On machines migrated from old nodes, the old Xray was still running on the host and holding the port. The new container would not start, giving `bind: address already in use`. Use `ss -tlnp | grep <port>` to find what is using it, `systemctl stop` to stop it, then restart the container.

**Tag not checked, port not listening.** This one was kind of dumb. Writing an inbound into the config does not mean the node will actually run it. You have to check the tag in the Panel for it to get pushed down to the node. Paste config, check tag, restart, then run `ss` to confirm the port is open. I spent way too long at the start not knowing what was wrong because I kept skipping this step.

**Subscription returns empty.** The subscription link just shows placeholder text (No hosts found / Check Hosts / Check Internal Squads). The cause is either the Host was not created, or the user was not added to a Squad that contains that Host.

**Oracle's two-layer firewall.** Oracle VPS has two separate firewalls: the Security List in the cloud console, and iptables inside the machine (Oracle's default image enables iptables and it has higher priority than ufw). The symptom: `curl 127.0.0.1:port` works locally but the Panel cannot connect (EHOSTUNREACH / timeout). You need to open the ports in both layers, including the business ports and port 20000.

**Typed the node IP wrong by one digit.** I missed one digit when entering the node address in the Panel and it kept timing out. I eventually figured out a useful pattern: timeout usually means the wrong address or packets being silently dropped; a wrong key gives an authentication error, not a timeout.

**Wrong Cloudflare rule type.** I wanted the Panel domain to be accessible without typing the port number in the URL. I used a Redirect Rule (301 redirect), which was wrong. The right tool is an Origin Rule, which only changes what port Cloudflare connects to on the backend, without touching the URL the visitor sees. Also, only the Panel domain should go through Cloudflare's proxy (orange cloud). Node domains must be DNS-only (grey cloud), otherwise REALITY and real TLS will not work through CF's proxy.

## TLS Certificate Auto-Renewal

Two of my nodes use real TLS with custom domains. I think this part is worth calling out on its own.

The certificate needs to be mounted into the container. In docker-compose, use a volume to map the certificate folder into the container, then point `certificateFile` and `keyFile` in your config to the paths inside the container. Do not use symlinks. The container cannot see what a symlink is pointing to.

By default, acme.sh only updates its own working directory when it renews a cert. It does not automatically copy the new certificate to wherever the container is reading from. The result is the node keeps using the expired certificate until things break. The fix is to use `--install-cert` to permanently register what acme.sh should do after each renewal:

```bash
acme.sh --install-cert -d your-domain --ecc \
  --fullchain-file /path/to/node/certs/fullchain.pem \
  --key-file /path/to/node/certs/key.pem \
  --reloadcmd "sudo docker restart container-name"
```

After this, every renewal goes like this: acme.sh copies the new cert to the container's folder, then runs the reloadcmd to restart the container. acme.sh's built-in cron handles when to renew. This command handles what to do after. You know it is set up correctly when the log shows `Installing full chain` then `Running reload cmd` then `Reload successful`.

One more thing: acme.sh is installed under a regular user account. Do not run it with sudo. Only the `docker restart` inside reloadcmd needs passwordless sudo.

## Result

<img src="/assets/remnawave_sc_2.png" alt="User list with individual status per person" style="width:100%;border-radius:8px;margin:24px 0;" />

All 6 servers are now connected to one panel. Each friend has their own UUID and subscription link, traffic is tracked per person, and TLS renewal takes care of itself. A big step up from everyone sharing the same UUID.

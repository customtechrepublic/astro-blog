---
title: "OpenWrt Configs You Can Pull Straight Onto Your Router"
description: "How our published OpenWrt configs work, and how to apply one safely."
pubDate: 2026-10-01
category: openwrt
tags: [openwrt, howto]
project: openwrt-wlt
---

Every config in the [config library](/openwrt/configs) is a plain UCI file you can fetch
directly on the router.

## Apply one safely

1. **Back up first:** `sysupgrade -b /tmp/backup.tar.gz`
2. **Fetch** the file with `wget` (each config page shows the exact command).
3. **Review** it — never apply a config you haven't read.
4. **Reload:** `/etc/init.d/firewall reload`

> ⚠️ Configs are examples. Interface names differ between devices — check yours with
> `uci show network`.

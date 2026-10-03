---
title: "Secure Baseline"
description: "Default-deny WAN firewall plus DNS rebind protection and malware-filtering resolvers."
openwrtVersion: "24.10.x"
devices: ["Any (generic)"]
category: firewall
files:
  - name: firewall
    path: /configs/secure-baseline/firewall
    target: /etc/config/firewall
  - name: dhcp-dns
    path: /configs/secure-baseline/dhcp-dns
    target: /etc/config/dhcp
updatedDate: 2026-10-03
project: openwrt-wlt
tags: [firewall, dns, starter]
---

A **starting point** for any OpenWrt router.

- **WAN:** inbound rejected, only DHCP renew + essential ICMPv6 allowed
- **DNS:** rebind protection on, Cloudflare _malware-blocking_ resolvers

> Example config — review every line before applying.

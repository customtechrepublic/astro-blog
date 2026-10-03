---
title: "Config name"
description: "What this config does, in one sentence."
openwrtVersion: "24.10.x"
devices: ["Any (generic)"]
category: firewall # firewall | wireless | vpn | dns | vlan | qos | system | full-image
files:
  # Put the raw file at public/configs/<slug>/<name>
  - name: firewall
    path: /configs/<slug>/firewall
    target: /etc/config/firewall
updatedDate: 2026-01-01
# project: openwrt-wlt
tags: []
---

**What it does** in one line.

> Example config — review every line before applying.

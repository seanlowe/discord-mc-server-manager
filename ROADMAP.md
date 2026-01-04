
## Roadmap

### Basic Functionality

- ✅ List all configured Minecraft servers (and print a status report)
- ✅ List currently running servers
- ✅ List available servers
- ✅ Start a server
- ✅ Stop a server
- ✅ Restart a server
- ✅ Check player count for a running server
- Add a help command

---

### Configuration & Safety

_nothing for now_

---

### Deployment & Operation

- Add PM2 support
  - Auto-restart on crash
  - Startup on boot
  - Centralized logs
- ✅ Remove SSH assumptions
  - All commands will execute locally once deployed

---

### UX & Reliability

- Improve error handling and Discord feedback
- Prevent duplicate or conflicting server actions

---

### Documentation

_nothing for now_

---

### Possible Future Enhancements

_(Not currently planned, but intentionally left open. Ideas welcome!)_

- Automatic shutdown on inactivity?
- Server uptime tracking
- Historical player count?
- Basic log inspection, or perhaps config to push logs to a discord channel
- Per-server permissions
- Configuration for custom server and rcon ports per server
  - This should help prevent the scenario where two different servers both run off the default 25565 port
- Clearer state transitions (starting vs running, stopping vs stopped)
- Safer handling of partial or failed startups


# Minecraft Server Manager Discord Bot

A Discord bot for controlling self-hosted Minecraft servers directly from Discord.

This bot is designed for people who **run their own servers** and want a lightweight, transparent way to start, stop, restart, and monitor them without maintaining a full web panel or SSHing into a box every time. Lord knows _that_ gets annoying.

If you’re comfortable hosting Minecraft servers, this tool should feel familiar — it’s really just a thin control layer placed on top of the regular docker commands.

---

## What This Bot Does

From Discord, you can:

### Server Control

- View all available Minecraft servers (servers which are currently stopped & ready to start)
- See which servers are currently running
- Start a server
- Stop a server
- Restart a server

Every action executes directly on the host machine, so what you see in Discord reflects the actual server state.

---

### Server Status & Monitoring

- Check player count for running servers
- Get immediate feedback when you start or stop a server
- Distinguish between stopped and running servers

This is meant to answer common questions quickly:

> “Is the server running?”
> “Is anyone on right now?”
> “Am I going to mess someone up if I restart this?”

---

## Who This Is For

This project is a good fit if you:
- Host one or more Minecraft servers yourself
- Are comfortable with Node.js and basic Linux/Docker administration
- Want a easy way to let your friends boot up a server you all play on without bugging you
- Users with a _small_, _privately-trusted_ group of friends - large communities should use a more robust hosting panel.

This is **not** intended to replace hosting panels like Pterodactyl or Multicraft. It’s closer to a **guarded remote terminal** than a full management platform.

---

## How It Works (High Level)

- **Runtime:** Node.js
- **Command execution:** Makes calls to the host machine using `execa`
- **Deployment target:** A single homelab server on the same machine as the Minecraft servers

The bot is intended to run **on the same machine that hosts the Minecraft servers**, keeping the control path simple and predictable.

> Note: If I've not made it clear already.. _this should be run on the **same machine** that hosts the Minecraft servers_.

---

## Design Philosophy

This bot aims to be:
- **Simple**: there's no hidden automation, just basic docker commands,
- **Transparent**: commands map directly to host actions,
- and **Predictable**: what you see in Discord reflects reality, not some inferred state

It intentionally avoids:
- Over-abstracting server control
- Too many notifications in Discord
- Managing per-server configuration
- Becoming a general-purpose hosting panel

If you’re already capable of running Minecraft servers, this tool is meant to make managing those servers _easier_, not add extra layers to it.

---

## Current Features

### Implemented

- List servers (available & running)
- Start / stop / restart servers
- See player count for running servers

### Known Limitations

- Configuration is still partially hardcoded (the docker commands, mostly)
- Environment variables are not fully standardized yet
- Some logic assumes development-time SSH usage
  - I develop on a different machine than the server. This can be worked around by setting NODE_ENV=production in your env file.
- No persistent state beyond process inspection
- Assumes rcon is enabled and running on port 25575 by default
- Swallows most errors, simply because Execa tries to error out on non-zero exit codes (`grep` returns a `1` on no match)
- Logging is pretty basic at the moment.

Some of these are addressed in the [roadmap](./ROADMAP.md).

---

## Command Reference

All interactions with the bot are done via **Discord slash commands**.

Commands are designed to be as single-purpose as possible. Practically nothing happens automatically without a user asking for it (unless it just makes sense to do so - like notifying users when restarting a server that has active players).

| Command  | "Equivalent" Docker Command | Description |
| -------- | --------------------------- | ----------- |
| `/list-servers`              | `docker ps`                           | Lists all known Minecraft servers that the bot is able to manage. <br /><br />This includes both servers that are currently stopped and running ones. |
| `/list-running-servers`      | `docker ps`                           | Lists only servers that are currently running. |
| `/list-available-servers`    | `docker ps`                           | Lists only servers that are currently stopped. |
| `/start-server <name>`       | `docker start <name>`                 | Starts the specified Minecraft server. Sends a follow-up message when the server is up and running. <br /><br />If a server is already running, it will not show up as an option in the command.|
| `/stop-server <name>`        | `docker stop <name>`                  | Stops the specified Minecraft server. <br /><br />If a server is not currently running, it will not show up as an option in the command.|
| `/restart-server <name>`     | `docker restart <name>`               | Restarts the specified Minecraft server. Sends a follow-up message when the server is back up and running. <br /><br /> - if there are currently players online, it will mention the specified role (set in `.env`) and send a message telling the players it is restarting. <br /><br /> If a server is not currently running, it will not show up as an option in the command. (same as `/stop-server`)|
| `/check-player-count <name>` | `docker exec <name> rcon-cli -- list` | Returns the current player count for a running server. <br /><br /> If a server is not currently running, it will not show up as an option in the command. (same as `/stop-server`)|

---

## Command Behavior Notes

- All commands operate against **real server processes**
- There is no cached or inferred state
- If a command fails, it reflects a real failure on the host (or a bug in this code - issues & PRs are welcome)
- The bot will not silently recover or retry destructive actions

If something doesn’t behave as expected, you should be able to reproduce the same behavior manually on the server.

---

## Permissions & Safety

The bot is intentionally conservative about destructive actions (didn't want someone to accidentally delete a server or mess with the rcon password).

Permissions are mostly up to you to set, but here are some things to keep in mind:
- If you have multiple groups of friends, you might want to set up a role and private channel, then only set the bot to respond to that channel.
- be aware that running this bot on your server means anyone in your server (barring strict permissions) can start and stop the docker containers that you allow. Practice caution.

This is meant to be safe for a small, trusted group — not a public-facing control system.

---

## Running the Bot

### Local Development

```bash
npm install
npm run dev
```

As I developed this bot on a different machine than the server, I needed some way to access the server's containers so I set it up to run commands over ssh to the host machine. You can get around this assumption by setting `NODE_ENV=production` in your `.env` file. This will make it run commands locally instead of over ssh.

### Production Deployment

> ⚠️ Current setup assumes direct access to the host machine.

Clone this repo to your host machine, then:
```bash
npm install
npm run start
```

`npm run start` runs the bot using PM2, which should keep it alive and restart it if it crashes.

> Note: Make sure you have added a file named `allowed-minecraft-servers.json` into the `data` directory that looks something like this:
```json
[
  { "name": "cottage-witch", "value": "cottage-witch" },
  { "name": "magic-and-tweaks", "value": "magic-and-tweaks" },
  { "name": "vanilla-server-1.20.2", "value": "vanilla-server-1.20.2" },
  { "name": "rad", "value": "rad" }
]
```

This file is used to filter out servers that the bot should not manage or display.

---

## Final Notes

If something goes wrong, you are still able to SSH into the server and run the same commands manually, like plebs do.

That’s intentional. Momma didn't raise no b--, eh, maybe I shouldn't say that.
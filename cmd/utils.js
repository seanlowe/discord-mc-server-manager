import { execa } from 'execa'
import { access } from "node:fs/promises"
import { constants, writeFileSync } from "node:fs"

import allowedMinecraftServers from '../data/allowed-minecraft-servers.json' with { type: 'json' }

export const allowedMinecraftServerNames = allowedMinecraftServers.map(server => server.name)
export const allowedMinecraftServersJson = allowedMinecraftServers

export const fileExists = async (path) => {
  try {
    await access(path, constants.F_OK)
    return true
  } catch {
    return false
  }
}

export const convertMsToISO = (ms) => {
  const date = new Date(ms)
  const iso = date.toISOString()

  return iso
}

export const getDockerContainers = async () => {
  const result = await makeDockerCall("docker ps -a --format '{{json .}}'")

  const rawContainerOutput = result.split('\n').map(line => JSON.parse(line))
    .filter(container => allowedMinecraftServerNames.includes(container.Names))

  return rawContainerOutput.map(c => ({
    created: c.RunningFor,
    state: c.State,
    status: c.Status,
    ports: c.Ports,
    name: c.Names,
  }))
}

export const makeDockerCall = async (command) => {
  const {
    NODE_ENV,
    SSH_USER,
    SSH_HOST,
    SSH_PASSWORD
  } = process.env

  // if we are local (for me, that is - developing on a different machine than the server),
  // then construct the execa command using ssh and the original command passed through,
  // if we are deployed on the server (i.e. "prod"), then construct the execa command using the original command passed through

  let commandsArray = []
  let startingCommand = null
  let commandEnv = {}
  if (NODE_ENV === 'production') {
    // use docker whatever

    // "docker start vanilla-minecraft" becomes ["docker", "start", "vanilla-minecraft"]
    commandsArray = command.split(' ')

    // should just be "docker" -> leaving commandsArray as ["start", "vanilla-minecraft"]
    startingCommand = commandsArray.shift()
  } else if (NODE_ENV === "development") {
    // need this so I can test it locally / get info from the server while developing locally
    const askpass = "/tmp/askpass.sh"
    if (!fileExists(askpass)) {
      writeFileSync(
        askpass,
        `#!/bin/sh\necho "$SSH_PASSWORD"\n`,
        { mode: 0o700 }
      )
    }

    // use ssh
    startingCommand = 'ssh'
    commandsArray = [
      `${SSH_USER}@${SSH_HOST}`,
      command
    ]
    commandEnv = {
      env: {
        ...process.env,
        SSH_ASKPASS: askpass,
        SSH_PASSWORD,
        SSH_ASKPASS_REQUIRE: "prefer",
      },
    }
  }

  try {
    const result = await execa(startingCommand, commandsArray, commandEnv)
    return result.stdout.trim()
  } catch (e) {
    // I don't give a shit about this error
    return null
  }
}

export const containerRecheckLoop = async (interaction, serverName, startTime, sinceTime, successMessage, failureMessage) => {
  const {
    MAX_WAIT_TIME,
    RECHECK_INTERVAL
  } = process.env

  // wait and confirm the server is running
  while (Date.now() - startTime <= MAX_WAIT_TIME) {
    const cmd = `docker logs --since ${sinceTime} ${serverName} | grep -F "[minecraft/DedicatedServer]: Done"`
    const result = await makeDockerCall(cmd)

    if (!result) {
      console.log(`Not ready yet. . . waiting ${RECHECK_INTERVAL / 1000} seconds.`)
      // check again in 7.5 seconds
      await new Promise(resolve => setTimeout(resolve, 7500))
    } else {
      await interaction.followUp(successMessage)
      break
    }
  }

  // if we've waited longer than the max wait time and it's still not running, something went wrong
  if (Date.now() - startTime >= MAX_WAIT_TIME) {
    await interaction.followUp(failureMessage)
  }
}

// determine whether to use plural form or singular, are or is
export const plural = (count, word = "server") => {
  if (count === 1) {
    return word + ' is'
  } else {
    return word + 's are'
  }
}
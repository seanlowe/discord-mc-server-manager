import { SlashCommandBuilder } from 'discord.js'

import { listServers } from './list-all-servers.js'

export const listRunningServersCommand = new SlashCommandBuilder().setName('list-running-servers').setDescription('List all running servers')

export const listRunningServersFunction = async (interaction) => {
  const result = await listRunningServers()

  await interaction.reply(result)
}

export const listRunningServers = async (returnEntireObject = false) => {
  const containers = await listServers(true)
  const runningContainers = containers.filter(c => c.state === 'running')

  if (!runningContainers.length) {
    return 'No servers are currently running.'
  }

  return returnEntireObject ? runningContainers : runningContainers.map(c => c.name).join('\n')
}

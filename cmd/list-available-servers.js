import { SlashCommandBuilder } from 'discord.js'

import { listServers } from './list-all-servers.js'

export const listAvailableServersCommand = new SlashCommandBuilder().setName('list-available-servers').setDescription('List all available servers')

export const listAvailableServersFunction = async (interaction) => {
  const result = await listAvailableServers()

  await interaction.reply(result)
}

export const listAvailableServers = async (returnEntireObject = false) => {
  const containers = await listServers(true)
  const stoppedContainers = containers.filter(c => c.state !== 'running')

  if (!stoppedContainers.length) {
    return 'No servers are currently available to start.'
  }

  return returnEntireObject ? stoppedContainers : stoppedContainers.map(c => c.name).join('\n')
}

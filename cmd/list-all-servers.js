import { SlashCommandBuilder } from 'discord.js'

import { checkPlayerCount } from './check-player-count.js'
import { plural, getDockerContainers } from './utils.js'

export const listServersCommand = new SlashCommandBuilder().setName('list-servers').setDescription('List all servers')

export const listServersFunction = async (interaction) => {
  const result = await listServers(true)

  const runningContainers = await Promise.all(result.filter(c => c.state === 'running').map(async c => {
    const players = await checkPlayerCount(c.name, true)

    return {
      ...c,
      players,
    }
  }))

  const stoppedContainers = result.filter(c => c.state !== 'running')

  const response = `### ${runningContainers.length} ${plural(runningContainers.length, 'server')} currently running:
  ${runningContainers.map(c => `- ${c.name} (${c.players})`).join('\n')}
  `.trim()

  const response2 = `### ${stoppedContainers.length} ${plural(stoppedContainers.length, 'server')} currently stopped:
  ${stoppedContainers.map(c => `- ${c.name}`).join('\n')}
  `.trim()

  await interaction.reply([response, response2].join('\n'))
}

export const listServers = async (returnEntireObject = false) => {
  const containers = await getDockerContainers()

  if (!containers.length) {
    return 'Could not find any servers.'
  }

  return returnEntireObject ? containers : containers.map(c => c.name).join('\n')
}

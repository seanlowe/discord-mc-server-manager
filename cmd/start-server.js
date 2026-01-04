import { SlashCommandBuilder } from 'discord.js'
import { listAvailableServers } from './list-available-servers.js'
import { makeDockerCall, convertMsToISO, containerRecheckLoop } from './utils.js'

export const startServerCommand = new SlashCommandBuilder().setName('start-server').setDescription('Starts the specified minecraft server')
  .addStringOption(
    option => option.setName('server')
      .setDescription('the server to start')
      .setRequired(true)
      .setAutocomplete(true)
    )

export const startServerAutocomplete = async (interaction, focusedOption) => {
  // get currently running servers dynamically
  const stoppedServers = Array.from(await listAvailableServers(true)).map(c => ({ name: c.name, value: c.name }))

  // filter choices based on what the user has typed so far
  const filtered = stoppedServers.filter(s => s.name.toLowerCase().includes(focusedOption.value.toLowerCase()))

  // won't ever have more than 25 options
  await interaction.respond(filtered)
}

export const startServerFunction = async (interaction) => {
  const serverToStart = interaction.options.getString('server')
  await interaction.reply(`Starting minecraft server: \`${serverToStart}\`. This may take a minute or two. I will notify you when it's up!`)

  const startTime = Date.now()
  const sinceTime = convertMsToISO(startTime)

  await makeDockerCall(`docker start ${serverToStart}`)

  await containerRecheckLoop(
    interaction,
    serverToStart,
    startTime,
    sinceTime,
    `Minecraft server \`${serverToStart}\` started!`,
    `Minecraft server ${serverToStart} failed to start. Please check the logs.`
  )
}

// startServerFunction()
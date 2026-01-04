import { SlashCommandBuilder } from 'discord.js'
import { listRunningServers } from './list-running-servers.js'
import { dockerCommands, makeDockerCall } from './utils.js'

export const stopServerCommand = new SlashCommandBuilder().setName('stop-server').setDescription('Stops the specified minecraft server')
  .addStringOption(
    option => option.setName('server')
      .setDescription(`the server to stop`)
      .setRequired(true)
      .setAutocomplete(true)
    )

export const stopServerAutocomplete = async (interaction, focusedOption) => {
  // get currently running servers dynamically
  const runningServers = Array.from(await listRunningServers(true)).map(c => ({ name: c.name, value: c.name }))

  // filter choices based on what the user has typed so far
  const filtered = runningServers.filter(s => s.name.toLowerCase().includes(focusedOption.value.toLowerCase()))

  // won't ever have more than 25 options
  await interaction.respond(filtered)
}

export const stopServerFunction = async (interaction) => {
  const serverToStop = interaction.options.getString('server')
  await interaction.reply(`Stopping minecraft server: \`${serverToStop}\`.`)

  await makeDockerCall(dockerCommands.stop(serverToStop))
}
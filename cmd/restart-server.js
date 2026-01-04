// check if server is running (in command)
// if there are players online, send a message @ the Minecraft role saying "Server is restarting"
// send docker restart command
// wait till server is up again, send a message @ the Minecraft role saying "Server is back up!"

import { SlashCommandBuilder } from 'discord.js'
import { containerRecheckLoop, convertMsToISO, makeDockerCall } from './utils.js'
import { checkPlayerCount } from './check-player-count.js'

export const restartServerCommand = new SlashCommandBuilder().setName('restart-server').setDescription('Restarts the specified minecraft server')
  .addStringOption(
    option => option.setName('server')
      .setDescription('the server to restart')
      .setRequired(true)
      .setAutocomplete(true)
    )

// autocomplete function is the same as the stop-server autocomplete function

export const restartServerFunction = async (interaction) => {
  const serverToRestart = interaction.options.getString('server')
  const minecraftRoleMention = `<@&${process.env.MENTION_ROLE_ID}>`
  let shouldUseMention = false

  const playersOnline = (await checkPlayerCount(serverToRestart, true)).split("/")[0]
  // if the first value of the playersOnline
  // which comes back as something like 1/20, (or ?/? if there was an error)
  // is not 0 or ?, we should use the mention
  if (!["0", "?"].includes(playersOnline)) {
    shouldUseMention = true
  }

  await interaction.reply(`${shouldUseMention ? minecraftRoleMention + " " : ""}Restarting minecraft server: \`${serverToRestart}\`. This may take a minute or two. I will notify you when it's back up!`)

  const startTime = Date.now()
  const sinceTime = convertMsToISO(startTime)

  await makeDockerCall(`docker restart ${serverToRestart}`)

  await containerRecheckLoop(
    interaction,
    serverToRestart,
    startTime,
    sinceTime,
    `${shouldUseMention ? minecraftRoleMention + " " : ""}Minecraft server \`${serverToRestart}\` is back up!`,
    `${shouldUseMention ? minecraftRoleMention + " " : ""}Minecraft server ${serverToRestart} failed to start. Please check the logs.`
  )
}

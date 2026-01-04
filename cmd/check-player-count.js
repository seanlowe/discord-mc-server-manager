import { SlashCommandBuilder } from 'discord.js'

import { listRunningServers } from './list-running-servers.js'
import { makeDockerCall, allowedMinecraftServerNames, dockerCommands } from './utils.js'

export const checkPlayerCountCommand = new SlashCommandBuilder().setName('check-player-count')
  .setDescription('Replies with the number of players online for the given server')
  .addStringOption(
    option => option.setName('server')
      .setDescription(`Check the player count for this server`)
      .setRequired(true)
      .setAutocomplete(true)
    )

// autocomplete function is the same as the stop-server autocomplete function

export const checkPlayerCount = async (serverName, shortFormat = false) => {
  // makes an assumption that server has rcon enabled and running on port 25575
  try {
    const response = await makeDockerCall(dockerCommands.execRcon(serverName, ["list"]))
    
    // returns something like:
    // There are 0 of a max of 20 players online:
  
    const result = response.substring(0,11) + "/" + response.substring(24, 41) + "."
  
    if (shortFormat) {
      // return only numPlayers/maxPlayers
      const match = result.match(/\b\d+\/\d+\b/)
  
      return match?.[0] ?? "?/?"
    } else {
      return result
    }
  } catch (e) {
    // there was some error accessing rcon or the result, so just return "?/?"
    return "?/?"
  }

}

export const checkPlayerCountFunction = async (interaction) => {
  const serverName = interaction.options.getString('server')
  if (!allowedMinecraftServerNames.includes(serverName)) {
    // shouldn't happen but you never know
    await interaction.reply(`Server name ${serverName} is not in the list of available servers to check.`)
    return
  }

  // passing "true" to have listRUnningServers return the entire object
  const runningServers = await listRunningServers(true)
  if (!runningServers.length) {
    await interaction.reply(`${serverName} is not currently running.`)
    return
  }

  const result = await checkPlayerCount(serverName)

  await interaction.reply(result)
}

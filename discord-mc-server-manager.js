import { Client, Collection, Events, GatewayIntentBits, REST, Routes } from 'discord.js'
import express from 'express'
import { commands, functions, autocompletes } from './cmd/index.js'
import { configDotenv } from 'dotenv'

configDotenv()

const {
  GUILD_ID,
  APP_ID,
  DISCORD_BOT_TOKEN,
  APP_PORT
} = process.env

const app = express()
const port = APP_PORT
const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN)

app.listen(port, () => {
  console.log(`MC Server Manager Bot listening at http://localhost:${port}`)
})

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
})

client.commands = new Collection()
for (const command of commands) {
  client.commands.set(command.name, command)
}

/* ----------------- */
/* Register Commands */
/* ----------------- */

console.log('Started refreshing application (/) commands.')

rest.put(Routes.applicationGuildCommands(APP_ID, GUILD_ID), { body: commands })
  .then(() => console.log('Successfully reloaded application (/) commands.'))
  .catch(error => console.error(error))

/* --------------- */
/* Event Listeners */
/* --------------- */

client.on(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}!`)
})

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isAutocomplete()) {
    const focusedOption = interaction.options.getFocused(true)
    autocompletes.get(interaction.commandName)(interaction, focusedOption)
    return
  }

  if (interaction.isChatInputCommand()) {
    functions.get(interaction.commandName)(interaction)
    return
  }
})

client.login(DISCORD_BOT_TOKEN)

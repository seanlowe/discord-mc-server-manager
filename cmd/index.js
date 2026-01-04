import { listAvailableServersCommand, listAvailableServersFunction } from './list-available-servers.js'
import { listRunningServersCommand, listRunningServersFunction } from './list-running-servers.js'
import { checkPlayerCountCommand, checkPlayerCountFunction } from './check-player-count.js'
import { listServersCommand, listServersFunction } from './list-all-servers.js'
import { startServerCommand, startServerFunction, startServerAutocomplete } from './start-server.js'
import { stopServerAutocomplete, stopServerCommand, stopServerFunction } from './stop-server.js'
import { restartServerCommand, restartServerFunction } from './restart-server.js'

export const autocompletes = new Map([
  ['start-server', startServerAutocomplete],
  ['check-player-count', stopServerAutocomplete],
  ['stop-server', stopServerAutocomplete],
  ['restart-server', stopServerAutocomplete],
])

export const commands = [
  listAvailableServersCommand,
  listRunningServersCommand,
  checkPlayerCountCommand,
  listServersCommand,
  startServerCommand,
  stopServerCommand,
  restartServerCommand
]

export const functions = new Map([
  ['list-available-servers', listAvailableServersFunction],
  ['list-running-servers', listRunningServersFunction],
  ['check-player-count', checkPlayerCountFunction],
  ['list-servers', listServersFunction],
  ['start-server', startServerFunction],
  ['stop-server', stopServerFunction],
  ['restart-server', restartServerFunction],
])

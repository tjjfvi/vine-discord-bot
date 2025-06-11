import { createBot, GatewayIntents } from "npm:@discordeno/bot@19.0.0"

import { env } from "./env.ts"
import { octicon } from "./octicon.ts"
import { desiredProperties, Message, User } from "./types.ts"
import { welcome } from "./welcome.ts"
import "./feed.ts"

export const bot = createBot({
  token: env.token,
  intents: GatewayIntents.GuildMessages | GatewayIntents.MessageContent,
  desiredProperties,
})

bot.events = {
  ready: ({ shardId }) => console.log(`Shard ${shardId} ready`),
  messageCreate: receiveMessage,
}

bot.start()

const commandRegex = /^[!:](\w+)\b\s*([^]*)$/
function receiveMessage(message: Message) {
  const result = commandRegex.exec(message.content)
  if (!result) return
  const [_, command, args] = result
  commands[command]?.(message, args)
}

const commands: Record<string, (message: Message, args: string) => void> = {
  async ping(message) {
    await bot.helpers.addReaction(message.channelId, message.id, "🏓")
  },

  octicon,
  welcome,
}

export function isAdmin(user: User): boolean {
  return env.admins.includes(user.id)
}

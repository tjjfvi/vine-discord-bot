import { bot, isAdmin } from "./main.ts"
import { Message } from "./types.ts"

const title = "Welcome to Vine!"

const color = 0x46c67c

const links: [string, string][] = [
  ["GitHub", "https://github.com/VineLang/vine"],
  ["Docs", "https://vine.dev/docs"],
  ["Invite", "https://discord.gg/bgUPV8KjDv"],
]

const description = `
Vine is an experimental new programming language based on interaction nets.

${links.map(([title, url]) => `[**${title}**](${url})`).join(` \xA0·\xA0 `)}
`.trim()

const url =
  "https://media.discordapp.net/attachments/820508213932851281/1246845867286331423/Vine.png?ex=681a28b4&is=6818d734&hm=f18e90f87605759403ae9a030069b5a6fa3679bcb3eca0a43fe400b5d3ab1eef&format=webp&quality=lossless&width=1404&height=1404"

export async function welcome(message: Message) {
  if (!isAdmin(message.author)) return
  await bot.helpers.sendMessage(message.channelId, {
    embeds: [
      { title, color, description, thumbnail: { url } },
    ],
  })
}

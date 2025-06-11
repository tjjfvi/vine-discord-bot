import { render } from "https://deno.land/x/resvg_wasm@0.2.0/mod.ts"
import { encodeBase64 } from "jsr:@std/encoding/base64"
import octicons from "npm:@primer/octicons@19.15.2"

import { bot, isAdmin } from "./main.ts"
import { Message } from "./types.ts"

export async function octicon(message: Message, args: string) {
  if (!isAdmin(message.author)) return
  const [name, icon, color] = args.split(" ")
  if (!name || !icon || !color) return
  const svg = octicons[icon].toSVG({ width: 128 })
    .replace(/^(<svg)/, `$1 xmlns="http://www.w3.org/2000/svg"`)
    .replace(/(<path)/g, `$1 fill="${color}"`)
  const image = "data:image.png;base64," + encodeBase64(
    await render(svg),
  )
  const emoji = await bot.helpers.createEmoji(message.guildId!, { name, image })
  const emojiString = `<:${emoji.name}:${emoji.id}>`
  await bot.helpers.sendMessage(message.channelId, {
    content: `${emojiString} \`${emojiString}\``,
  })
}

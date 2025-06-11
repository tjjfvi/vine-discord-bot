import {
  Bot,
  CompleteDesiredProperties,
  createDesiredPropertiesObject,
} from "npm:@discordeno/bot@19.0.0"

type DPO = Parameters<typeof createDesiredPropertiesObject>[0]

function makeDPO<T extends DPO>(x: T): T {
  return x
}

export const desiredProperties = makeDPO({
  user: {
    id: true,
    toggles: true,
    username: true,
  },
  message: {
    id: true,
    author: true,
    content: true,
    channelId: true,
    guildId: true,
  },
  webhook: {
    id: true,
    token: true,
  },
  emoji: {
    id: true,
    name: true,
  },
})

type Types = Bot<
  CompleteDesiredProperties<typeof desiredProperties>
>["transformers"]["$inferredTypes"]

export type Message = Types["message"]
export type User = Types["user"]

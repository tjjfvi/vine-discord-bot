import { env } from "../_env.ts"
export { env }

type Emoji = `<:${string}:${bigint}>`

export interface Env {
  token: string
  admins: bigint[]
  emojis: {
    comment: Emoji
    issue: {
      open: Emoji
      completed: Emoji
      unplanned: Emoji
    }
    pr: {
      open: Emoji
      draft: Emoji
      merged: Emoji
      closed: Emoji
    }
    review: {
      comment: Emoji
      approve: Emoji
      request_changes: Emoji
    }
  }
  feed: {
    githubWebhook: {
      secret: string
      proxyUrl?: string
      port?: number
    }
    discordWebhook: {
      id: bigint
      token: string
    }
  }
}

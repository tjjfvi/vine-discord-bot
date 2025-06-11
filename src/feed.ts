import { createWebMiddleware, EmitterWebhookEvent, Webhooks } from "npm:@octokit/webhooks@14.0.2"
import { env } from "./env.ts"
import { bot } from "./main.ts"

const config = env.feed
const emojis = env.emojis

const webhooks = new Webhooks({
  secret: config.githubWebhook.secret,
})

webhooks.onAny(async (ev) => {
  const message = webhookMessage(ev)
  if (message) {
    await bot.helpers.executeWebhook(config.discordWebhook.id, config.discordWebhook.token, {
      content: message.join(" "),
      username: ev.payload.sender?.login,
      avatarUrl: ev.payload.sender?.avatar_url,
      allowedMentions: { parse: [] },
    })
  }
})

if (config.githubWebhook.proxyUrl != null) {
  const source = new EventSource(config.githubWebhook.proxyUrl)
  source.onmessage = (event) => {
    const webhookEvent = JSON.parse(event.data)
    webhooks.receive({
      id: webhookEvent["x-request-id"],
      name: webhookEvent["x-github-event"],
      payload: webhookEvent.body,
    })
  }
}

if (config.githubWebhook.port != null) {
  Deno.serve({ port: config.githubWebhook.port }, createWebMiddleware(webhooks))
}

function webhookMessage({ name, payload }: EmitterWebhookEvent): string[] | undefined {
  if (name === "issues") {
    if (payload.action === "opened") {
      return [issue(payload.issue), quote(payload.issue.body)]
    }
    if (payload.action === "closed" || payload.action === "reopened") {
      return [issue(payload.issue)]
    }
  }
  if (name === "issue_comment") {
    if (payload.action === "created") {
      return [emojis.comment, issue(payload.issue), quote(payload.comment.body)]
    }
  }
  if (name === "pull_request") {
    if (payload.action === "opened") {
      return [pullRequest(payload.pull_request), quote(payload.pull_request.body)]
    }
    if (
      payload.action === "closed"
      || payload.action === "reopened"
      || payload.action === "converted_to_draft"
      || payload.action === "ready_for_review"
    ) {
      return [pullRequest(payload.pull_request)]
    }
  }
  if (name === "pull_request_review") {
    if (payload.action === "submitted") {
      if (payload.review.state === "commented" && !payload.review.body) {
        return
      }
      return [
        review(payload.review),
        pullRequest(payload.pull_request),
        quote(payload.review.body),
      ]
    }
  }
  if (name === "pull_request_review_comment") {
    if (payload.action === "created") {
      return [
        emojis.review.comment,
        emojis.comment,
        pullRequest(payload.pull_request),
        quote(payload.comment.body),
      ]
    }
  }
  function quote(body: string | null): string {
    if (!("repository" in payload)) throw new Error("no repository")
    if (!body || !body.trim()) return ""
    const repoName = payload.repository!.full_name
    return "\n" + body
      .replace(/\r\n/g, "\n")
      .replace(/(https?:\/\/[-a-zA-Z0-9@:%_\+.~#?&\/=]*)/g, "<$1>")
      .replace(
        /(\w+\/\w+)?#(\d+)/g,
        (content, repo, id) =>
          `[${content}](<https://github.com/${repo ?? repoName}/issues/${id}>)`,
      )
      .replace(/^/gm, "> ")
  }
}

function issue(issue: Issue): string {
  if (issue.pull_request) {
    return pullRequest({ ...issue, ...issue.pull_request })
  }
  const emoji = issue.state === "open"
    ? emojis.issue.open
    : issue.state_reason === "completed"
    ? emojis.issue.completed
    : emojis.issue.unplanned
  return `${emoji} [${issue.title} #${issue.number}](<${issue.html_url}>)`
}

function pullRequest(pr: PullRequest): string {
  const emoji = pr.state === "open"
    ? pr.draft
      ? emojis.pr.draft
      : emojis.pr.open
    : pr.merged_at
    ? emojis.pr.merged
    : emojis.pr.closed
  return `${emoji} [${pr.title} #${pr.number}](<${pr.html_url}>)`
}

function review(review: Review) {
  return review.state === "approved"
    ? emojis.review.approve
    : review.state === "changes_requested"
    ? emojis.review.request_changes
    : emojis.review.comment
}

type Issue = EmitterWebhookEvent<"issues" | "issue_comment">["payload"]["issue"]
type PullRequest =
  | EmitterWebhookEvent<"pull_request" | "pull_request_review_comment">["payload"]["pull_request"]
  | NonNullable<Issue & Issue["pull_request"]>
type Review = EmitterWebhookEvent<"pull_request_review">["payload"]["review"]

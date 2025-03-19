export type MisskeyWebhookHeader = {
    "X-Misskey-Hook-Secret": string | undefined,
}

export type MisskeyWebhookBody<T> = {
    type: string | undefined,
    body: T | undefined,
}

export type MisskeyWebhookBodyBodyMention = {
    id: string | undefined,
    text: string | undefined,
    user: {
        id: string | undefined,
        username: string | undefined,
        host: string | undefined,
    } | undefined,
    reply_id: string | undefined,
}
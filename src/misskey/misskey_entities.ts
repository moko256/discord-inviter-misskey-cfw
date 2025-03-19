export type MisskeyDmReplyParam = {
    apiHost: string,
    apiToken: MisskeyApiToken,
    noteIdReplyTo: MisskeyNoteId,
    userIdReplyTo: MisskeyUserId,
    message: string,
    localOnly: boolean,
}

export type MisskeyUser = {
    id: MisskeyUserId,
    username: string,
    host: string | undefined,
}

export type MisskeyNoteId = string
export type MisskeyUserId = string
export type MisskeyApiToken = string
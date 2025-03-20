export type MisskeyApiTokenInput = {
    i: string,
}

export type MisskeyApiNotesCreateInput = {
    visibility: string,
    visibleUserIds: string[],
    text: string | undefined,
    localOnly: boolean,
    replyId: string | undefined,
}

export class MisskeyApi {
    #host: string
    #tokenBody: MisskeyApiTokenInput

    constructor(
        host: string,
        token: string,
    ) {
        this.#host = host
        this.#tokenBody = {
            i: token
        }
    }

    async notesCreate(input: MisskeyApiNotesCreateInput) {
        await this.#postApi("notes/create", input)
    }

    async #postApi<T>(path: string, bodyWithoutToken: T) {
        const body = {
            ...this.#tokenBody,
            ...bodyWithoutToken,
        }
        const response = await fetch(
            `https://${this.#host}/api/${path}`,
            {
                body: JSON.stringify(body),
                method: "POST",
                headers: {
                    "content-type": "application/json;charset=UTF-8",
                },
            },
        );
        if (response.status != 200) {
            throw new Error(`Post for Misskey failed: ${response.status}`)
        }
    }
}
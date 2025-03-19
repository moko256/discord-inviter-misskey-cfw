export type MisskeyApiTokenInput = {
    i: string,
}

export type MisskeyApiNotesCreateInput = {
    visibility: string,
    visible_user_ids: string[],
    text: string | undefined,
    local_only: boolean,
    reply_id: string | undefined,
}

export class MisskeyApi {
    constructor(
        private host: string,
        private token: string,
    ) { }

    private tokenBody: MisskeyApiTokenInput = {
        i: this.token
    }

    notesCreate(input: MisskeyApiNotesCreateInput) {
        this.postApi("notes/create", input)
    }

    private async postApi<T>(path: string, bodyWithoutToken: T) {
        const body = {
            ...this.tokenBody,
            ...bodyWithoutToken,
        }
        await fetch(
            `https://${this.host}/api/${path}`,
            {
                body: JSON.stringify(body),
                method: "POST",
                headers: {
                    "content-type": "application/json;charset=UTF-8",
                },
            },
        );
    }
}
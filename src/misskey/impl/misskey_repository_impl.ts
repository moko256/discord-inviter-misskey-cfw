import { MisskeyDmReplyParam } from "../misskey_entities";
import { MisskeyRepository } from "../misskey_repository";
import { MisskeyApi } from "./misskey_api";

export class MisskeyRepositoryImpl implements MisskeyRepository {
    async postReplyDm(input: MisskeyDmReplyParam): Promise<void> {
        const api = new MisskeyApi(input.apiHost, input.apiToken)
        await api.notesCreate({
            visibility: "specified",
            visible_user_ids: [input.userIdReplyTo],
            text: input.message,
            local_only: input.localOnly,
            reply_id: input.noteIdReplyTo,
        })
    }
}
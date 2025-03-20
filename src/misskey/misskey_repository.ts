import { MisskeyDmReplyParam } from './misskey_entities';

export interface MisskeyRepository {
	postReplyDm(input: MisskeyDmReplyParam): Promise<void>;
}

import { ConfigRepository } from "./config/config_repository";
import { DiscordInviteUrl } from "./discord/discord_entities";
import { DiscordRepository } from "./discord/discord_repository";
import { MisskeyRepository } from "./misskey/misskey_repository";
import { MisskeyWebhookBody, MisskeyWebhookBodyBodyMention, MisskeyWebhookHeader } from "./misskey_webhook";

export interface InviterUseCase {
    doInvite(
        requestHeader: MisskeyWebhookHeader,
        requestBodyMention: MisskeyWebhookBody<MisskeyWebhookBodyBodyMention>,
    ): Promise<void>
}

export class InviterUseCaseImpl implements InviterUseCase {
    constructor(
        private configRepository: ConfigRepository,
        private discordRepository: DiscordRepository,
        private misskeyRepository: MisskeyRepository,
    ) { }
    async doInvite(requestHeader: MisskeyWebhookHeader, requestBodyMention: MisskeyWebhookBody<MisskeyWebhookBodyBodyMention>): Promise<void> {
        const config = this.configRepository.getConfig()
        if (requestHeader["X-Misskey-Hook-Secret"] != config.misskeyWebhookSecret) {
            console.error("Invalid webhook secret.");
            throw new InviterUseCaseError(InviterUseCaseErrorType.InvalidWebhookSecret);
        }

        if (requestBodyMention.body == null || requestBodyMention.type != "mention" || requestBodyMention.body.reply_id != undefined) {
            console.log("This message isn't a mention. Do nothing.");
            return
        }

        if (requestBodyMention.body.text?.startsWith(config.misskeyBotUsername) != true) {
            console.log("This message is a mention but not at the top. Do nothing.");
            return
        }

        const userHost = requestBodyMention.body.user?.host
        const noteId = requestBodyMention.body.id
        const userId = requestBodyMention.body.user?.id
        const userUsername = requestBodyMention.body.user?.username

        if (userId == undefined || userUsername == undefined || noteId == undefined) {
            console.log("Invalid message. Do nothing.");
            return
        }

        if (userHost == undefined) {
            // Generate and send invitation url.
            const reason = `@${userUsername}@${userHost} (${userId})`

            let url: DiscordInviteUrl;

            try {
                url = await this.discordRepository.generateInviteUrl({
                    reason: reason,
                });
            } catch (e) {
                console.error("Failed to get invitation url from Discord");
                console.error(e);
                throw new InviterUseCaseError(InviterUseCaseErrorType.InvitationFailure);
            }

            // Send reply
            const msg = `@${userUsername} ${config.botReplyMessageOkInvite}\n${url}`
            try {
                await this.misskeyRepository.postReplyDm({
                    apiHost: config.misskeyHost,
                    apiToken: config.misskeyBotToken,
                    noteIdReplyTo: noteId,
                    userIdReplyTo: userId,
                    message: msg,
                    localOnly: true,
                });
            } catch (e) {
                console.error("Failed to post to Misskey");
                console.error(e);
                throw new InviterUseCaseError(InviterUseCaseErrorType.InvitationFailure);
            }

            console.log(
                `Accepted request from: @${userUsername} (${userId}) \"${requestBodyMention.body.text}\", code: \`${url}\``
            );
        } else {
            // Reject request because the note is from remote.
            const msg = `@${userUsername}@${userHost} ${config.botReplyMessageErrRemoteUser}`
            try {
                await this.misskeyRepository.postReplyDm({
                    apiHost: config.misskeyHost,
                    apiToken: config.misskeyBotToken,
                    noteIdReplyTo: noteId,
                    userIdReplyTo: userId,
                    message: msg,
                    localOnly: false,
                });
            } catch (e) {
                console.error("Failed to post to Misskey");
                console.error(e);
                throw new InviterUseCaseError(InviterUseCaseErrorType.InvitationFailure);
            }

            console.log(
                `Rejected request from remote user: @${userUsername}@${userHost} (${userId}) \"${requestBodyMention.body.text}\"`
            );
        }
    }


}

export class InviterUseCaseError extends Error {
	static InvalidWebhookSecret: any;
    constructor(
        public type: InviterUseCaseErrorType,
    ) {
        super(`reason: ${type}`);
    }
}

export enum InviterUseCaseErrorType {
    InvalidWebhookSecret,
    InvitationFailure,
}
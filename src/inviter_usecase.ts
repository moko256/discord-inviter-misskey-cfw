import { ConfigRepository } from './config/config_repository';
import { DiscordInviteUrl } from './discord/discord_entities';
import { DiscordRepository } from './discord/discord_repository';
import { MisskeyRepository } from './misskey/misskey_repository';
import { MisskeyWebhookBody, MisskeyWebhookBodyBodyMention, MisskeyWebhookHeader } from './misskey_webhook';

export interface InviterUseCase {
	doInvite(requestHeader: MisskeyWebhookHeader, requestBodyMention: MisskeyWebhookBody<MisskeyWebhookBodyBodyMention>): Promise<void>;
}

export class InviterUseCaseImpl implements InviterUseCase {
	#configRepository: ConfigRepository;
	#discordRepository: DiscordRepository;
	#misskeyRepository: MisskeyRepository;

	constructor(configRepository: ConfigRepository, discordRepository: DiscordRepository, misskeyRepository: MisskeyRepository) {
		this.#configRepository = configRepository;
		this.#discordRepository = discordRepository;
		this.#misskeyRepository = misskeyRepository;
	}

	async doInvite(
		requestHeader: MisskeyWebhookHeader,
		requestBodyMention: MisskeyWebhookBody<MisskeyWebhookBodyBodyMention>,
	): Promise<void> {
		const config = this.#configRepository.getConfig();
		if (requestHeader['X-Misskey-Hook-Secret'] != config.misskeyWebhookSecret) {
			console.error('Invalid webhook secret.');
			throw new InviterUseCaseError(InviterUseCaseErrorType.InvalidWebhookSecret);
		}

		const note = requestBodyMention.body?.note;
		if (requestBodyMention.type != 'mention' || note == null || note.reply_id != undefined) {
			console.log("This message isn't a mention. Do nothing.");
			return;
		}

		if (note.text?.startsWith(config.misskeyBotUsername) != true) {
			console.log('This message is a mention but not at the top. Do nothing.');
			return;
		}

		const userHost = note.user?.host;
		const noteId = note.id;
		const userId = note.user?.id;
		const userUsername = note.user?.username;

		if (userId == undefined || userUsername == undefined || noteId == undefined) {
			console.log('Invalid message. Do nothing.');
			return;
		}

		if (userHost == undefined) {
			// Generate and send invitation url.
			const reason = `@${userUsername}@${config.misskeyHost} (${userId})`;

			let url: DiscordInviteUrl;

			try {
				url = await this.#discordRepository.generateInviteUrl({
					botToken: config.discordBotToken,
					channelId: config.discordChannelIdInvite,
					reason: reason,
				});
			} catch (e) {
				console.error('Failed to get invitation url from Discord');
				console.error(e);
				throw new InviterUseCaseError(InviterUseCaseErrorType.InvitationFailure);
			}

			// Send reply
			const msg = `@${userUsername} ${config.botReplyMessageOkInvite}\n${url}`;
			try {
				await this.#misskeyRepository.postReplyDm({
					apiHost: config.misskeyHost,
					apiToken: config.misskeyBotToken,
					noteIdReplyTo: noteId,
					userIdReplyTo: userId,
					message: msg,
					localOnly: true,
				});
			} catch (e) {
				console.error('Failed to post to Misskey');
				console.error(e);
				throw new InviterUseCaseError(InviterUseCaseErrorType.InvitationFailure);
			}

			console.log(`Accepted request from: @${userUsername} (${userId}) \"${note.text}\", code: \`${url}\``);
		} else {
			// Reject request because the note is from remote.
			const msg = `@${userUsername}@${userHost} ${config.botReplyMessageErrRemoteUser}`;
			try {
				await this.#misskeyRepository.postReplyDm({
					apiHost: config.misskeyHost,
					apiToken: config.misskeyBotToken,
					noteIdReplyTo: noteId,
					userIdReplyTo: userId,
					message: msg,
					localOnly: false,
				});
			} catch (e) {
				console.error('Failed to post to Misskey');
				console.error(e);
				throw new InviterUseCaseError(InviterUseCaseErrorType.InvitationFailure);
			}

			console.log(`Rejected request from remote user: @${userUsername}@${userHost} (${userId}) \"${note.text}\"`);
		}
	}
}

export class InviterUseCaseError extends Error {
	static InvalidWebhookSecret: any;
	constructor(public type: InviterUseCaseErrorType) {
		super(`reason: ${type}`);
	}
}

export const enum InviterUseCaseErrorType {
	InvalidWebhookSecret,
	InvitationFailure,
}

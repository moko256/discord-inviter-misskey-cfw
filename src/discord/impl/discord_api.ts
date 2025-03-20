export type DiscordApiChannelsInvitesInputPath = {
	channelId: string;
};

export type DiscordApiChannelsInvitesInputBody = {
	max_age: number;
	max_uses: number;
	unique: boolean;
};

export type DiscordApiChannelsInvitesInputHeader = {
	'X-Audit-Log-Reason': string | undefined;
};

export type DiscordApiChannelsInvitesOutput = {
	code: string;
};

export class DiscordApi {
	#botToken: string;
	#userAgentClientName: string;
	#userAgentClientVersion: string;

	constructor(botToken: string, userAgentClientName: string, userAgentClientVersion: string) {
		this.#botToken = botToken;
		this.#userAgentClientName = userAgentClientName;
		this.#userAgentClientVersion = userAgentClientVersion;
	}

	async channelsInvites(
		inputPath: DiscordApiChannelsInvitesInputPath,
		inputBody: DiscordApiChannelsInvitesInputBody,
		inputHeader: DiscordApiChannelsInvitesInputHeader,
	): Promise<DiscordApiChannelsInvitesOutput> {
		return await this.#fetchApi('POST', `channels/${inputPath.channelId}/invites`, inputBody, inputHeader);
	}

	async #fetchApi<T, H, R>(method: string, path: string, body: T, header: H | undefined = undefined): Promise<R> {
		const response = await fetch(`https://discord.com/api/v10/${path}`, {
			body: JSON.stringify(body),
			method: method,
			headers: {
				Authorization: `Bot ${this.#botToken}`,
				'User-Agent': `DiscordBot (${this.#userAgentClientName}, ${this.#userAgentClientVersion})`,
				'Content-Type': 'application/json;charset=UTF-8',
				...header,
			},
		});
		if (response.status != 200) {
			throw new Error(`Post for Misskey failed: ${response.status}`);
		}

		return await response.json<R>();
	}
}

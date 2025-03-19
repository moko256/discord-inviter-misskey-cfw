import { DiscordCreateInviteParam, DiscordInviteUrl } from "../discord_entities";
import { DiscordRepository } from "../discord_repository";
import { DiscordApi } from "./discord_api";

export class DiscordRepositoryImpl implements DiscordRepository {
    constructor(
        private userAgentClientName: string,
        private userAgentClientVersion: string,
    ) {}

    async generateInviteUrl(input: DiscordCreateInviteParam): Promise<DiscordInviteUrl> {
        const api = new DiscordApi(input.botToken, this.userAgentClientName, this.userAgentClientVersion)
        const result = await api.channelsInvites(
            {
                channelId: input.channelId,
            },
            {
                max_age: 3600,
                max_uses: 1,
                unique: true,
            },
            {
                "X-Audit-Log-Reason": input.reason,
            },
        )
        return `https://discord.gg/${result.code}`
    }
}
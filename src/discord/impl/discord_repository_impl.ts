import { DiscordCreateInviteParam, DiscordInviteUrl } from "../discord_entities";
import { DiscordRepository } from "../discord_repository";

export class DiscordRepositoryImpl implements DiscordRepository {
    async generateInviteUrl(input: DiscordCreateInviteParam): Promise<DiscordInviteUrl> {
        return "TODO"
    }
}
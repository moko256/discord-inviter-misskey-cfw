import { DiscordCreateInviteParam, DiscordInviteUrl } from './discord_entities';

export interface DiscordRepository {
	generateInviteUrl(input: DiscordCreateInviteParam): Promise<DiscordInviteUrl>;
}

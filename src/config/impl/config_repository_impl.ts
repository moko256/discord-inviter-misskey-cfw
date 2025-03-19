import { Config } from "../config_entities"
import { ConfigRepository } from "../config_repository"
import config from "../../../config.json"

export class ConfigRepositoryImpl implements ConfigRepository {
    getConfig(): Config {
        try {
            return {
                misskeyHost: config.misskeyHost!,
                misskeyBotUsername: config.misskeyBotUsername!,
                misskeyBotToken: config.misskeyBotToken!,
                misskeyWebhookSecret: config.misskeyWebhookSecret!,
                discordBotToken: config.discordBotToken!,
                discordChannelIdInvite: config.discordChannelIdInvite!,
                botReplyMessageOkInvite: config.botReplyMessageOkInvite!,
                botReplyMessageErrRemoteUser: config.botReplyMessageErrRemoteUser!,
            }
        } catch(e) {
            console.error("Failed to parse config. Check `config.json`.")
            throw e
        }
    }
    
}
import { Hono } from 'hono'
import { ConfigRepositoryImpl } from './config/impl/config_repository_impl'
import { DiscordRepositoryImpl } from './discord/impl/discord_repository_impl'
import { MisskeyRepositoryImpl } from './misskey/impl/misskey_repository_impl'
import { ConfigRepository } from './config/config_repository'
import { DiscordRepository } from './discord/discord_repository'
import { MisskeyRepository } from './misskey/misskey_repository'
import { InviterUseCase, InviterUseCaseError, InviterUseCaseErrorType, InviterUseCaseImpl } from './inviter_usecase'
import { MisskeyWebhookBody, MisskeyWebhookBodyBodyMention } from './misskey_webhook'

const app = new Hono()

app.get('/info', (c) => {
	return c.text('Status: OK')
})

app.post('/webhook', async (c) => {
	const configRepository: ConfigRepository = new ConfigRepositoryImpl()
	const discordRepository: DiscordRepository = new DiscordRepositoryImpl()
	const misskeyRepository: MisskeyRepository = new MisskeyRepositoryImpl()

	const inviterUseCase: InviterUseCase = new InviterUseCaseImpl(
		configRepository,
		discordRepository,
		misskeyRepository,
	)

	try {
		await inviterUseCase.doInvite(
			{
				'X-Misskey-Hook-Secret': c.req.header('X-Misskey-Hook-Secret')
			},
			await c.req.json<MisskeyWebhookBody<MisskeyWebhookBodyBodyMention>>(),
		);

		return c.text('Success')
	} catch (e) {
		if (e instanceof InviterUseCaseError) {
			switch (e.type) {
				case InviterUseCaseErrorType.InvalidWebhookSecret:
					// Invalid secret.
					return c.text('Bad Request', 400)
				case InviterUseCaseErrorType.InvitationFailure:
					// API failure.
					return c.text('Service Unavailable', 503)
				default:
					return c.text('Internal Server Error', 500)
			}
		}
	}

	return c.text('Internal Server Error', 500)
})

export default app
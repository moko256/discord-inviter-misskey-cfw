// test/index.spec.ts
import { env } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import app from '../src/index';

import config from '../config.json';
import config_test from './config-test.json';
import { MisskeyWebhookBody, MisskeyWebhookBodyBodyMention, MisskeyWebhookHeader } from '../src/misskey_webhook';

describe('/info', () => {
	it('Should success', async () => {
		const response = await app.request('/info', {}, env);
		expect(await response.text()).toMatchInlineSnapshot(`"Status: OK"`);
	});
});

describe.skipIf(config_test?.runIntegrationTest != true)('/webhook', () => {
	it('Should fail with empty', async () => {
		const response = await app.request('/webhook', { method: 'POST' }, env);
		expect(response.status).toMatchInlineSnapshot(`500`);
	});

	it('Should fail with empty json', async () => {
		const response = await app.request('/webhook', { method: 'POST', body: JSON.stringify({}) }, env);
		expect(response.status).toMatchInlineSnapshot(`400`);
	});

	it('Should fail with invalid token', async () => {
		const headers: MisskeyWebhookHeader & Record<string, string> = {
			'X-Misskey-Hook-Secret': 'INVALID_TOKEN',
		};
		const response = await app.request('/webhook', { method: 'POST', body: JSON.stringify({}), headers: headers }, env);
		expect(response.status).toMatchInlineSnapshot(`400`);
	});

	it('Should success from remote user', async () => {
		const headers: MisskeyWebhookHeader & Record<string, string> = {
			'X-Misskey-Hook-Secret': config.misskeyWebhookSecret,
		};
		const jsonBody: MisskeyWebhookBody<MisskeyWebhookBodyBodyMention> = {
			type: 'mention',
			body: {
				note: {
					id: config_test.testWebhook.noteId,
					text: `${config.misskeyBotUsername} test`,
					user: {
						id: config_test.testWebhook.userId,
						username: config_test.testWebhook.userUsername,
						host: config.misskeyHost,
					},
					reply_id: undefined,
				},
			},
		};
		const response = await app.request('/webhook', { method: 'POST', body: JSON.stringify(jsonBody), headers: headers }, env);
		expect(response.status).toMatchInlineSnapshot(`200`);
	});

	it('Should success from local user', async () => {
		const headers: MisskeyWebhookHeader & Record<string, string> = {
			'X-Misskey-Hook-Secret': config.misskeyWebhookSecret,
		};
		const jsonBody: MisskeyWebhookBody<MisskeyWebhookBodyBodyMention> = {
			type: 'mention',
			body: {
				note: {
					id: config_test.testWebhook.noteId,
					text: `${config.misskeyBotUsername} test`,
					user: {
						id: config_test.testWebhook.userId,
						username: config_test.testWebhook.userUsername,
						host: undefined,
					},
					reply_id: undefined,
				},
			},
		};
		const response = await app.request('/webhook', { method: 'POST', body: JSON.stringify(jsonBody), headers: headers }, env);
		expect(response.status).toMatchInlineSnapshot(`200`);
	});
});

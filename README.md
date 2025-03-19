## discord-inviter-misskey-cfw
Simple Misskey and Discord bot to distribute Discord guild invitation to users in the Misskey instance.
It works on Cloudflare Worker.

Initial implementation: https://github.com/moko256/discord_inviter_misskey

### Features
Here, bot username at Misskey is `@bot`.
- Reply invitation URL to the mention `@bot ...`.

### Usage

- Prepare acoounts

Discord:
1. Create Discord bot.
2. Open this url: `https://discord.com/oauth2/authorize?client_id=${YOUR_CLIENT_ID}&permissions=1&scope=bot` (replace `${YOUR_CLIENT_ID}` with bot's client id)
3. Select a guild and agree.

Misskey:
1. Create Misskey account for a bot.
2. Create access token with this permissions: `read:account`, `write:notes`, `read:notifications`, `write:notifications`
3. Generate secret for Webhook with appropriate tools. e.g. Node.js:
```js
require('crypto').randomBytes(63).toString('base64')
```

- Setup
```bash
npm install

cp bot_config.template.json bot_config.json
# Edit `bot_config.json` here.
```

- Deploy
```bash
npm run deploy
```
After first deploy:
1. Create Webhook in Misskey.
    - Name: insert appropriately.
    - URL: `https://discord-inviter-misskey-cfw.${YOUR_CLOUDFLARE_USERNAME}/webhook` (replace `${YOUR_CLOUDFLARE_USERNAME}` with your cloudflare's subdomain)
    - Secret: insert one generated above.
    - Trigger:
        - On mentioned: On
        - The others: Off

Open `https://discord-inviter-misskey-cfw.${YOUR_CLOUDFLARE_USERNAME}/info` (replace `${YOUR_CLOUDFLARE_USERNAME}` with your cloudflare's subdomain) and check `Status: OK`

- Debug
```bash
npm run dev
```

- Test
```bash
cp test/config-test.template.json test/config-test.json
# Edit `test/config-test.json` here.

npm run test
```

### License
SPDX-License-Identifier: AGPL-3.0-or-later

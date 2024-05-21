# misskey-webhook-to-discord
MisskeyのWebhookをDiscordに転送するCfWorker

## セットアップ
1. KVを作成する
```bash
pnpx wrangler kv:namespace create KV

# ✨ Success!
# Add the following to your configuration file in your kv_namespaces array:
# { binding = "KV", id = "551140f776e14d82ac680e777918eef8" }
```
2. 表示されたIDを控えておく (上記の場合は`551140f776e14d82ac680e777918eef8`)
3. `wrangler.toml`のkv_namespaces内にあるidを書き換える
```diff
[[kv_namespaces]]
binding = "KV"
-id = "1091c85365ab4b588f595adb5d136f66"
+id = "551140f776e14d82ac680e777918eef8"
```
4. デプロイをする
```bash
pnpm run deploy

# ...
# Uploaded misskey-webhook-to-discord (1.63 sec)
# Published misskey-webhook-to-discord (3.82 sec)
#   https://misskey-webhook-to-discord.example.workers.dev
# Current Deployment ID: 0d41a885-b906-44e0-b565...
# ...
```
5. 表示されたWorkerのURLを控えておく (上記の場合は`https://misskey-webhook-to-discord.example.workers.dev`)
6. Cloudflareのダッシュボードから、先程作成したKVを編集する
   - Workers & Pages -> KV -> misskey-webhook-to-discord-KV -> view
   - 下記の「設定項目 (KV)」を参考に、キーと値を追加
7. Misskey側で設定する
   - 設定 -> Webhook -> Webhookを作成
   - 任意の名前を入力し、URLに先程控えたWorkerのURLを入力し、**末尾に`/proxy`を追加します**
	 - 例: `https://misskey-webhook-to-discord.example.workers.dev/proxy`
   - 手順6で設定した`misskeyWebhookSecret`をシークレットの欄に入力し、Webhookを作成
8. おわり

## 設定項目 (KV)

### `discordWebhookUrl`
DiscordのWebhook URLを指定します

- Key: `discordWebhookUrl`
- ExampleValue: `https://discord.com/api/webhooks/1234567890123456789/_vHHT-xcnx...`

### `misskeyWebhookSecret`
Misskey側で設定するWebhookのシークレット (パスワード) を指定します

- Key: `misskeyWebhookSecret`
- ExampleValue: `my-secret`

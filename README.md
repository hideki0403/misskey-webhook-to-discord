# misskey-webhook-to-discord
MisskeyのWebhookをDiscordに転送するCfWorker

## セットアップ方法
### デプロイをする
```bash
pnpm run deploy

# ...
# Uploaded misskey-webhook-to-discord (1.63 sec)
# Published misskey-webhook-to-discord (3.82 sec)
#   https://misskey-webhook-to-discord.example.workers.dev
# Current Deployment ID: 0d41a885-b906-44e0-b565...
# ...
```

### 表示されたWorkerのURLを控えておく
上記の場合は`https://misskey-webhook-to-discord.example.workers.dev`です

### 送信したいDiscordチャンネルのIDとWebhookシークレットを控えておく
任意のチャンネルで作成したWebhookURLから、チャンネルIDとシークレットを控えておきます。  
`https://discord.com/api/webhooks/<チャンネルID>/<シークレット>`  

> [!TIP]
> 例: <https://discord.com/api/webhooks/1234567890123456789/0L_DoZjEduE_3ZI_p5VKjJ56Tq8_uFQQACWneiyCe1YYaCW3GJwxJIJ9FnXN1yUjNfga>  
>   
> 上記のようなURLがあった場合には、チャンネルIDとシークレットは以下のようになります  
>   
> チャンネルID: `1234567890123456789`  
> シークレット: `0L_DoZjEduE_3ZI_p5VKjJ56Tq8_uFQQACWneiyCe1YYaCW3GJwxJIJ9FnXN1yUjNfga`  


### Misskey側で設定する
設定 -> Webhook -> Webhookを作成 (またはコントロールパネル -> Webhook -> Webhookを作成)  
  
以下のように設定してください

**名前**: (任意)  
**URL**: 先程控えたWorkerのURLの末尾に`/api/webhooks/<DiscordのチャンネルID>`を付けたもの  
(例: <https://misskey-webhook-to-discord.example.workers.dev/api/webhooks/1234567890123456789>)  
**シークレット**: 先程控えたDiscordのWebhookシークレット

> [!NOTE]
> もしあなたがサーバー管理者で、通報に関するWebhookを転送したいと考えている場合は、**追加で以下の設定を行う必要があります。**  
>   
> コントロールパネル -> 通報 -> 通知設定 -> 通報の通知先を追加 -> 先程作成したWebhookを選択
>
> この設定を行わないとWebhookが送信されません (1敗)

### おわり
以上で設定は完了です。  
これでMisskeyのWebhookがDiscordに転送されるようになるはずです。

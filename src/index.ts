import { Hono } from 'hono'
import { EmbedGenerator } from './discord'
import { error, misskeyApi, getUserText } from './utils'
import type { MetaLite, User } from 'misskey-js/entities.js'
import type { MisskeyWebhookPayload } from './types'

type Bindings = {
	KV: KVNamespace;
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', r => r.redirect('https://github.com/hideki0403/misskey-webhook-to-discord/'))
app.post('/api/webhooks/:id/:token', async r => {
	const secret = r.req.header('X-Misskey-Hook-Secret')
	const misskeyWebhookSecret = await r.env.KV.get('misskeyWebhookSecret')
	if (misskeyWebhookSecret != null && secret !== misskeyWebhookSecret) {
		return r.json({
			status: 'error',
			message: 'Invalid secret'
		}, 401)
	}

	const channelId = r.req.param('id')
	if (!channelId) return r.json(error('ChannelID is required'), 400)

	const token = r.req.param('token')
	if (!token) return r.json(error('Token is required'), 400)

	const payload = await r.req.json<MisskeyWebhookPayload>()
	const embed = new EmbedGenerator().setTitle('Unknown')

	switch (payload.type) {
		case 'note': {
			embed.setColor(0x007aff)
			embed.setTitle('Note')
			embed.setDescription(payload.body.note.text)
			embed.setMisskeyUser(payload.body.note.user)
			break
		}

		case 'reply': {
			embed.setColor(0x007aff)
			embed.setTitle('Reply')
			embed.setDescription(payload.body.note.text)
			embed.setMisskeyUser(payload.body.note.user)
			break
		}

		case 'renote': {
			embed.setColor(0x36d298)
			embed.setTitle('Renote')
			embed.setDescription(payload.body.note.text)
			embed.setMisskeyUser(payload.body.note.user)
			break
		}

		case 'mention': {
			embed.setColor(0x88a6b7)
			embed.setTitle('Mention')
			embed.setDescription(payload.body.note.text)
			embed.setMisskeyUser(payload.body.note.user)
			break
		}

		case 'unfollow': {
			embed.setColor(0xcb9a11)
			embed.setTitle('Unfollow')
			embed.setDescription(`Unfollowed ${payload.body.user.name}`)
			embed.setMisskeyUser(payload.body.user)
			break
		}

		case 'follow': {
			embed.setColor(0x36aed2)
			embed.setTitle('Follow')
			embed.setDescription(`Follow ${payload.body.user.name}`)
			embed.setMisskeyUser(payload.body.user)
			break
		}

		case 'followed': {
			embed.setColor(0x36aed2)
			embed.setTitle('Followed')
			embed.setDescription(`Followed ${payload.body.user.name}`)
			embed.setMisskeyUser(payload.body.user)
			break
		}

		case 'reaction': {
			embed.setColor(0x36d298)
			embed.setTitle('Reaction')
			embed.setDescription('Reaction')
			break
		}

		case 'abuseReport':
		case 'abuseReportResolved': {
			const reporter = await misskeyApi<User>(payload.server, 'users/show', { userId: payload.body.reporterId })
			const reportedUser = await misskeyApi<User>(payload.server, 'users/show', { userId: payload.body.targetUserId })
			const assignee = payload.body.assigneeId ? await misskeyApi<User>(payload.server, 'users/show', { userId: payload.body.assigneeId }) : null

			if (payload.type === 'abuseReport') {
				embed.setColor(0xdd2e44)
				embed.setTitle('Created abuse report')
				embed.setDescription(`Created abuse report by ${reporter.name}\n[View](${payload.server}/admin/abuses)`)
			} else {
				embed.setColor(0x36d298)
				embed.setTitle('Resolved abuse report')
				embed.setDescription(`Resolved abuse report by ${assignee?.name || '???'}`)
			}

			embed.addField('Comment', payload.body.comment, false)
			embed.addField('Reporter', getUserText(payload.server, reporter), true)
			embed.addField('Reported user', getUserText(payload.server, reportedUser), true)

			if (assignee) embed.addField('Assignee', getUserText(payload.server, assignee), true)
			if (reportedUser.avatarUrl) embed.setThumbnail(reportedUser.avatarUrl)

			break
		}

		case 'userCreated': {
			embed.setColor(0xcb9a11)
			embed.setTitle('User created')
			embed.setDescription(`User created: [${payload.body.name}](${payload.server}/@${payload.body.username})`)
			break
		}
	}

	const instance = await misskeyApi<MetaLite>(payload.server, 'meta')

	embed.setTimestamp(new Date(payload.createdAt))
	embed.setFooter({
		text: `${instance.shortName ?? instance.name ?? 'Misskey'} (${instance.uri.replace(/^https?:\/\//, '')})`,
		icon_url: instance.iconUrl ?? undefined
	})

	try {
		await embed.sendWebhook(channelId, token)
	} catch (e) {
		console.error(e)
		return r.json(error('Failed to send webhook. Please check the channel ID and secret.'), 500)
	}

	return r.json({
		status: 'ok',
	})
})

app.post('/api/purge-cache/:key', async r => {
	const secret = r.req.header('X-Secret')
	const webhookSecret = await r.env.KV.get('misskeyWebhookSecret')
	if (webhookSecret != null && secret !== webhookSecret) {
		return r.json({
			status: 'error',
			message: 'Invalid secret'
		}, 401)
	}

	const cache = caches.default
	const result = await cache.delete(decodeURIComponent(atob(r.req.param('key'))))

	return r.json({
		status: 'ok',
		purged: result
	})
})

export default app

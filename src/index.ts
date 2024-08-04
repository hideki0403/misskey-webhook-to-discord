import { Hono } from 'hono'
import type { User } from 'misskey-js/entities.js'
import { error, misskeyApi, getUserText } from './utils'
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
	let color = 0x000000
	let title = 'Unknown'
	let content: string | null = null
	let user: User | null = null

	const fields: { name: string, value: string }[] = []

	switch (payload.type) {
		case 'note': {
			color = 0x007aff
			title = 'Note'
			content = payload.body.note.text
			user = payload.body.note.user
			break
		}

		case 'reply': {
			color = 0x007aff
			title = 'Reply'
			content = payload.body.note.text
			user = payload.body.note.user
			break
		}

		case 'renote': {
			color = 0x36d298
			title = 'Renote'
			content = payload.body.note.text
			user = payload.body.note.user
			break
		}

		case 'mention': {
			color = 0x88a6b7
			title = 'Mention'
			content = payload.body.note.text
			user = payload.body.note.user
			break
		}

		case 'unfollow': {
			color = 0xcb9a11
			title = 'Unfollow'
			content = `Unfollowed ${payload.body.user.name}`
			user = payload.body.user
			break
		}

		case 'follow': {
			color = 0x36aed2
			title = 'Follow'
			content = `Follow ${payload.body.user.name}`
			user = payload.body.user
			break
		}

		case 'followed': {
			color = 0x36aed2
			title = 'Followed'
			content = `Followed ${payload.body.user.name}`
			user = payload.body.user
			break
		}

		case 'reaction': {
			color = 0x36d298
			title = 'Reaction'
			content = 'Reaction'
			break
		}

		case 'abuseReport':
		case 'abuseReportResolved': {
			const reporter = await misskeyApi<User>(payload.server, 'users/show', { userId: payload.body.reporterId })
			const reportedUser = await misskeyApi<User>(payload.server, 'users/show', { userId: payload.body.targetUserId })
			const assignee = payload.body.assigneeId ? await misskeyApi<User>(payload.server, 'users/show', { userId: payload.body.assigneeId }) : null

			if (payload.type === 'abuseReport') {
				color = 0xdd2e44
				title = 'Created abuse report'
				content = `Created abuse report by ${reporter.name}\n[View](${payload.server}/admin/abuses)`
			} else {
				color = 0x36d298
				title = 'Resolved abuse report'
				content = `Resolved abuse report by ${assignee?.name || '???'}`
			}

			fields.push({
				name: 'Comment',
				value: payload.body.comment
			})

			fields.push({
				name: 'Reporter',
				value: getUserText(payload.server, reporter)
			})

			fields.push({
				name: 'Reported user',
				value: getUserText(payload.server, reportedUser)
			})

			if (assignee) {
				fields.push({
					name: 'Assignee',
					value: getUserText(payload.server, assignee)
				})
			}

			break
		}

		case 'userCreated': {
			color = 0xcb9a11
			title = 'User created'
			content = `User created: [${payload.body.name}](${payload.server}/@${payload.body.username})`
			break
		}
	}

	const embed = {
		author: user ? {
			name: user.name,
			icon_url: user.avatarUrl
		} : undefined,
		title,
		color,
		description: content,
		fields: fields.length ? fields : undefined,
		footer: {
			text: `Misskey (${payload.server.replace(/^https?:\/\//, '')})`
		},
		timestamp: new Date(payload.createdAt).toISOString()
	}

	try {
		await fetch(`https://discord.com/api/webhooks/${channelId}/${token}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				embeds: [embed]
			})
		})
	} catch (e) {
		console.error(e)
		return r.json(error('Failed to send webhook. Please check the channel ID and secret.'), 500)
	}

	return r.json({
		status: 'ok',
	})
})

export default app

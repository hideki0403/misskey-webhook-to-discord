import { Hono } from 'hono'
import type { User } from 'misskey-js/entities.js'
import type { MisskeyWebhookPayload } from './types'

const app = new Hono()

app.get('/', r => r.redirect('https://github.com/hideki0403/misskey-webhook-to-discord/'))
app.post('/api/webhooks/:id', async r => {
	const secret = r.req.header('X-Misskey-Hook-Secret')
	if (!secret) return r.json(error('Secret is required'), 400)

	const channelId = r.req.param('id')
	if (!channelId) return r.json(error('ChannelID is required'), 400)

	const body = await r.req.json<MisskeyWebhookPayload>()
	let color = 0x000000
	let title = 'Unknown'
	let content: string | null = null
	let user: User | null = null

	switch (body.type) {
		case 'note':
			color = 0x007aff
			title = 'Note'
			content = body.body.note.text
			user = body.body.note.user
			break
		case 'reply':
			color = 0x007aff
			title = 'Reply'
			content = body.body.note.text
			user = body.body.note.user
			break
		case 'renote':
			color = 0x36d298
			title = 'Renote'
			content = body.body.note.text
			user = body.body.note.user
			break
		case 'mention':
			color = 0x88a6b7
			title = 'Mention'
			content = body.body.note.text
			user = body.body.note.user
			break
		case 'unfollow':
			color = 0xcb9a11
			title = 'Unfollow'
			content = `Unfollowed ${body.body.user.name}`
			user = body.body.user
			break
		case 'follow':
			color = 0x36aed2
			title = 'Follow'
			content = `Follow ${body.body.user.name}`
			user = body.body.user
			break
		case 'followed':
			color = 0x36aed2
			title = 'Followed'
			content = `Followed ${body.body.user.name}`
			user = body.body.user
			break
		case 'reaction':
			color = 0x36d298
			title = 'Reaction'
			content = 'Reaction'
			break
	}

	const embed = {
		author: user ? {
			name: user.name,
			icon_url: user.avatarUrl
		} : undefined,
		title,
		color,
		description: content,
		footer: {
			text: `Misskey (${body.server.replace(/^https?:\/\//, '')})`
		},
		timestamp: new Date(body.createdAt).toISOString()
	}

	try {
		await fetch(`https://discord.com/api/webhooks/${channelId}/${secret}`, {
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

function error(message: string) {
	return {
		status: 'error',
		message
	}
}

export default app

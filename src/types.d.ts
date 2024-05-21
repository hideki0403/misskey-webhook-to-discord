import type { Note, UserDetailedNotMe } from 'misskey-js/entities.js'

// webhookEventTypes = ['note', 'reply', 'renote', 'mention', 'unfollow', 'follow', 'followed', 'reaction']

export type MisskeyWebhookPayload = NotePayload | ReplyPayload | RenotePayload | MentionPayload | UnfollowPayload | FollowPayload | FollowedPayload | ReactionPayload

type BasePayload = {
	server: string
	hookId: string
	userId: string
	eventId: string
	createdAt: number
	type: string
	body: unknown
}

type NotePayload = BasePayload & {
	type: 'note'
	body: {
		note: Note
	}
}

type ReplyPayload = BasePayload & {
	type: 'reply'
	body: {
		note: Note
	}
}

type RenotePayload = BasePayload & {
	type: 'renote'
	body: {
		note: Note
	}
}

type MentionPayload = BasePayload & {
	type: 'mention'
	body: {
		note: Note
	}
}

type UnfollowPayload = BasePayload & {
	type: 'unfollow'
	body: {
		user: UserDetailedNotMe
	}
}

type FollowPayload = BasePayload & {
	type: 'follow'
	body: {
		user: UserDetailedNotMe
	}
}

type FollowedPayload = BasePayload & {
	type: 'followed'
	body: {
		user: UserDetailedNotMe
	}
}

// 未実装？
type ReactionPayload = BasePayload & {
	type: 'reaction'
	body: {
		reaction: unknown
	}
}

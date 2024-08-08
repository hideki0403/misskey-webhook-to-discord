import type { AdminAbuseUserReportsResponse, Note, UserDetailedNotMe, UserLite } from 'misskey-js/entities.js'

// userWebhookEventTypes = ['note', 'reply', 'renote', 'mention', 'unfollow', 'follow', 'followed', 'reaction']
// systemWebhookEventTypes = ['abuseReport', 'abuseReportResolved', 'userCreated']

export type MisskeyWebhookPayload = NotePayload | ReplyPayload | RenotePayload | MentionPayload | UnfollowPayload | FollowPayload | FollowedPayload | ReactionPayload | AbuseReportPayload | AbuseReportResolvedPayload | UserCreatedPayload

type BaseUserPayload = {
	server: string
	hookId: string
	userId: string
	eventId: string
	createdAt: number
	type: string
	body: unknown
}

type BaseSystemPayload = {
	server: string
	hookId: string
	eventId: string
	createdAt: number
	type: string
	body: unknown
}

type AbuseReport = {
	id: string
	targetUserId: string
	reporterId: string
	assigneeId: string | null
	resolved: boolean
	forwarded: boolean
	comment: string
	targetUserHost: string | null
	reporterHost: string | null
}

/* User Webhook */
type NotePayload = BaseUserPayload & {
	type: 'note'
	body: {
		note: Note
	}
}

type ReplyPayload = BaseUserPayload & {
	type: 'reply'
	body: {
		note: Note
	}
}

type RenotePayload = BaseUserPayload & {
	type: 'renote'
	body: {
		note: Note
	}
}

type MentionPayload = BaseUserPayload & {
	type: 'mention'
	body: {
		note: Note
	}
}

type UnfollowPayload = BaseUserPayload & {
	type: 'unfollow'
	body: {
		user: UserDetailedNotMe
	}
}

type FollowPayload = BaseUserPayload & {
	type: 'follow'
	body: {
		user: UserDetailedNotMe
	}
}

type FollowedPayload = BaseUserPayload & {
	type: 'followed'
	body: {
		user: UserDetailedNotMe
	}
}

// 未実装？
type ReactionPayload = BaseUserPayload & {
	type: 'reaction'
	body: {
		reaction: unknown
	}
}

/* System Webhook */
type AbuseReportPayload = BaseSystemPayload & {
	type: 'abuseReport'
	body: AbuseReport
}

type AbuseReportResolvedPayload = BaseSystemPayload & {
	type: 'abuseReportResolved'
	body: AbuseReport
}

type UserCreatedPayload = BaseSystemPayload & {
	type: 'userCreated'
	body: UserLite
}

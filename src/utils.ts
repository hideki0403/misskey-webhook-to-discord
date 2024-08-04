import type { User } from 'misskey-js/entities.js'

export function error(message: string) {
	return {
		status: 'error',
		message
	}
}

export function beautifyText(text: string) {
	return text.split('\n').map(x => x.replace(/^(\t| {2,})/g, '')).filter(x => x).join('\n')
}

export function getUserText(server: string, user: User) {
	return beautifyText(`
		[${user.name}](${server}/@${user.username}${user.host ? `@${user.host}` : ''})
		@${user.username}${user.host ? `@${user.host}` : ''} (${user.id})
	`)
}

export async function misskeyApi<T>(server: string, endpoint: string, payload?: Record<string, unknown>) {
	return fetch(`${server}/api/${endpoint}`, {
		body: JSON.stringify(payload),
		method: 'POST',
		headers: {
			'content-type': 'application/json;charset=UTF-8',
		},
	}).then(x => x.json() as Promise<T>)
}

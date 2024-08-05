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

export async function misskeyApi<T>(server: string, endpoint: string, payload?: Record<string, unknown>, ignoreCache = false) {
	if (server.endsWith('/')) server = server.slice(0, -1)
	if (endpoint.startsWith('/')) endpoint = endpoint.slice(1)

	const path = new URL(`${server}/api/${endpoint}`)
	const cache = caches.default
	const cacheKey = new Request(path.toString() + (payload ? `/${hash(JSON.stringify(payload))}` : ''), {
		method: 'GET',
	})

	const cacheData = await cache.match(cacheKey)
	if (!ignoreCache && cacheData) {
		return await cacheData.json() as T
	}

	const result = await fetch(path, {
		body: JSON.stringify(payload ?? {}),
		method: 'POST',
		headers: {
			'content-type': 'application/json;charset=UTF-8',
		},
	}).then(x => x.json()) as T

	const cacheExpires = new Date()
	cacheExpires.setHours(cacheExpires.getHours() + 1)

	const response = new Response(JSON.stringify(result), {
		status: 200,
		headers: {
			'content-type': 'application/json;charset=UTF-8',
			'Expires': cacheExpires.toUTCString(),
		},
	})

	await cache.put(cacheKey, response.clone())
	return result
}

// MurmurHash3
export function hash(str: string) {
	const key = new TextEncoder().encode(str)
	let i = 0
	let h1 = 0
	let k1
	let h1b

	const remainder = key.length & 3
	const bytes = key.length - remainder
	const c1 = 0xcc_9e_2d_51
	const c2 = 0x1b_87_35_93

	while (i < bytes) {
		k1 = (key[i] & 0xff) | ((key[++i] & 0xff) << 8) | ((key[++i] & 0xff) << 16) | ((key[++i] & 0xff) << 24)
		++i

		k1 = ((k1 & 0xff_ff) * c1 + ((((k1 >>> 16) * c1) & 0xff_ff) << 16)) & 0xff_ff_ff_ff
		k1 = (k1 << 15) | (k1 >>> 17)
		k1 = ((k1 & 0xff_ff) * c2 + ((((k1 >>> 16) * c2) & 0xff_ff) << 16)) & 0xff_ff_ff_ff

		h1 ^= k1
		h1 = (h1 << 13) | (h1 >>> 19)
		h1b = ((h1 & 0xff_ff) * 5 + ((((h1 >>> 16) * 5) & 0xff_ff) << 16)) & 0xff_ff_ff_ff
		h1 = (h1b & 0xff_ff) + 0x6b_64 + ((((h1b >>> 16) + 0xe6_54) & 0xff_ff) << 16)
	}

	k1 = 0

	switch (remainder) {
		case 3: {
			k1 ^= (key[i + 2] & 0xff) << 16
			break
		}
		case 2: {
			k1 ^= (key[i + 1] & 0xff) << 8
			break
		}
		case 1: {
			k1 ^= key[i] & 0xff
			k1 = ((k1 & 0xff_ff) * c1 + ((((k1 >>> 16) * c1) & 0xff_ff) << 16)) & 0xff_ff_ff_ff
			k1 = (k1 << 15) | (k1 >>> 17)
			k1 = ((k1 & 0xff_ff) * c2 + ((((k1 >>> 16) * c2) & 0xff_ff) << 16)) & 0xff_ff_ff_ff
			h1 ^= k1
		}
	}

	h1 ^= key.length
	h1 ^= h1 >>> 16
	h1 = ((h1 & 0xff_ff) * 0x85_eb_ca_6b + ((((h1 >>> 16) * 0x85_eb_ca_6b) & 0xff_ff) << 16)) & 0xff_ff_ff_ff
	h1 ^= h1 >>> 13
	h1 = ((h1 & 0xff_ff) * 0xc2_b2_ae_35 + ((((h1 >>> 16) * 0xc2_b2_ae_35) & 0xff_ff) << 16)) & 0xff_ff_ff_ff
	h1 ^= h1 >>> 16

	return (h1 >>> 0).toString(16)
}

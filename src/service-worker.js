/// <reference types="@sveltejs/kit" />
import { build, files, prerendered, version } from '$service-worker'

const CACHE = `cache-${version}`
// build = bundled JS/CSS, files = everything in static/ (incl. artist
// images and fonts), prerendered = the exported pages. Caching all of it
// makes the full schedule work offline on the festival grounds.
const ASSETS = [...build, ...files, ...prerendered]

self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(CACHE)
			.then(cache => cache.addAll(ASSETS))
			.then(() => self.skipWaiting())
	)
})

self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys().then(async keys => {
			for (const key of keys) {
				if (key !== CACHE) await caches.delete(key)
			}
			self.clients.claim()
		})
	)
})

self.addEventListener('fetch', event => {
	if (event.request.method !== 'GET' || event.request.headers.has('range')) return

	const url = new URL(event.request.url)
	if (!url.protocol.startsWith('http')) return

	event.respondWith((async () => {
		const cache = await caches.open(CACHE)

		if (url.origin === self.location.origin && ASSETS.includes(url.pathname)) {
			const cached = await cache.match(url.pathname)
			if (cached) return cached
		}

		try {
			const response = await fetch(event.request)
			if (response.ok && url.origin === self.location.origin) {
				cache.put(event.request, response.clone())
			}
			return response
		} catch (err) {
			const cached = await cache.match(event.request)
			if (cached) return cached
			throw err
		}
	})())
})

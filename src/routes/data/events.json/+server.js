import { json } from '@sveltejs/kit'
import events from '$lib/data/events.json'

export const prerender = true
export const GET = () => json(events)

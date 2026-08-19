import { json } from '@sveltejs/kit'
import artists from '$lib/data/artists.json'

export const prerender = true
export const GET = () => json(artists)

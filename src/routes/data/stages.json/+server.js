import { json } from '@sveltejs/kit'
import stages from '$lib/data/stages.json'

export const prerender = true
export const GET = () => json(stages)

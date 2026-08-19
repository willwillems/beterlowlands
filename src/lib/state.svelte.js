import { browser } from '$app/environment'

export const ui = $state({
	searchOpen: false,
	activeArtistId: null,
	favoritesOnly: false,
})

const STORAGE_KEY = 'beterlowlands:favorites'
const stored = browser ? JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') : []

export const favorites = $state({ list: stored })

export const isFavorite = id => favorites.list.includes(id)

export const toggleFavorite = id => {
	const i = favorites.list.indexOf(id)
	if (i === -1) favorites.list.push(id)
	else favorites.list.splice(i, 1)
	if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites.list]))
}

export const scrollToArtist = id => {
	document.querySelector(`[data-artist-id="${id}"]`)
		?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
}

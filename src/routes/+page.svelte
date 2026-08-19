<script>
	import { onMount, tick } from 'svelte'
	import { browser } from '$app/environment'
	import artists from '$lib/data/artists.json'
	import TimeTable from '$lib/components/TimeTable.svelte'
	import DayNav from '$lib/components/DayNav.svelte'
	import ArtistModal from '$lib/components/ArtistModal.svelte'
	import SearchOverlay from '$lib/components/SearchOverlay.svelte'
	import { days, minutesToX, minutesSinceStart } from '$lib/schedule'
	import { ui, scrollToArtist } from '$lib/state.svelte.js'

	let scroller = $state(null)
	let activeDay = $state(0)

	const activeArtist = $derived(artists.find(artist => artist.id === ui.activeArtistId) ?? null)

	const jumpToDay = i => {
		scroller?.scrollTo({ left: minutesToX(minutesSinceStart(days[i].start)), behavior: 'smooth' })
	}

	// Deep links: /#act-<id> opens that act's modal
	onMount(async () => {
		const match = location.hash.match(/^#act-(\d+)$/)
		if (match) {
			ui.activeArtistId = Number(match[1])
			await tick()
			scrollToArtist(ui.activeArtistId)
		}
	})

	$effect(() => {
		if (!browser) return
		history.replaceState(null, '', ui.activeArtistId ? `#act-${ui.activeArtistId}` : location.pathname + location.search)
	})
</script>

<DayNav {activeDay} onjump={jumpToDay} />
<TimeTable bind:scroller ondaychange={day => activeDay = day} onopen={id => ui.activeArtistId = id} />

{#if ui.searchOpen}
	<SearchOverlay />
{/if}
{#if activeArtist}
	<ArtistModal artist={activeArtist} onclose={() => ui.activeArtistId = null} />
{/if}

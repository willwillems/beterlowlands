<script>
	import { onMount, tick } from 'svelte'
	import { browser } from '$app/environment'
	import artists from '$lib/data/artists.json'
	import TimeTable from '$lib/components/TimeTable.svelte'
	import DayNav from '$lib/components/DayNav.svelte'
	import ArtistModal from '$lib/components/ArtistModal.svelte'
	import SearchOverlay from '$lib/components/SearchOverlay.svelte'
	import { days, minutesToX, minutesSinceStart, dayIndexAt, nowInAmsterdam, TOTAL_HOURS } from '$lib/schedule'
	import { ui, scrollToArtist } from '$lib/state.svelte.js'

	let scroller = $state(null)
	let scrollMinutes = $state(0)
	const activeDay = $derived(dayIndexAt(scrollMinutes))

	const activeArtist = $derived(artists.find(artist => artist.id === ui.activeArtistId) ?? null)

	const jumpToDay = i => {
		if (!scroller) return
		// Jumping to the day that's happening right now lands on the
		// now-cursor instead of the day start.
		const now = minutesSinceStart(nowInAmsterdam())
		const isCurrentDay = now >= 0 && now <= TOTAL_HOURS * 60 && dayIndexAt(now) === i
		const left = isCurrentDay
			? Math.max(0, minutesToX(now) - scroller.clientWidth / 3)
			: minutesToX(minutesSinceStart(days[i].start))
		scroller.scrollTo({ left, behavior: 'smooth' })
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

<DayNav {scrollMinutes} {activeDay} onjump={jumpToDay} />
<TimeTable bind:scroller onprogress={minutes => scrollMinutes = minutes} onopen={id => ui.activeArtistId = id} />

{#if ui.searchOpen}
	<SearchOverlay />
{/if}
{#if activeArtist}
	<ArtistModal artist={activeArtist} onclose={() => ui.activeArtistId = null} />
{/if}

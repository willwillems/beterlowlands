<script>
	import { onMount } from 'svelte'
	import events from '$lib/data/events.json'
	import venues from '$lib/data/stages.json'
	import artists from '$lib/data/artists.json'
	import ArtistModal from '$lib/components/ArtistModal.svelte'
	import { days, minutesSinceStart, nowInAmsterdam, TOTAL_HOURS } from '$lib/schedule'
	import { ui } from '$lib/state.svelte.js'

	const TOTAL_MINUTES = TOTAL_HOURS * 60

	const artistById = new Map(artists.map(a => [a.id, a]))
	const venueTitle = id => (venues.find(v => v.id === id) || {}).title

	const slots = Object.values(events).flat().map(event => ({
		...event,
		startMin: minutesSinceStart(event.start),
		endMin: minutesSinceStart(event.end),
	}))

	// The page is prerendered, so the clock only starts ticking on the client.
	let now = $state(null)
	const tick = () => now = minutesSinceStart(nowInAmsterdam())
	onMount(() => {
		tick()
		const interval = setInterval(tick, 30_000)
		return () => clearInterval(interval)
	})

	const onNow = $derived(now === null ? [] : slots
		.filter(slot => slot.startMin <= now && now < slot.endMin)
		.sort((a, b) => a.endMin - b.endMin || a.venueId - b.venueId))

	const upcoming = $derived(now === null ? [] : slots
		.filter(slot => slot.startMin > now && slot.startMin <= now + 60)
		.sort((a, b) => a.startMin - b.startMin || a.venueId - b.venueId))

	const activeArtist = $derived(artists.find(artist => artist.id === ui.activeArtistId) ?? null)
</script>

<svelte:head>
	<title>Now</title>
</svelte:head>

<div class="now-page">
	{#if now === null}
		<!-- waiting for the client clock -->
	{:else if now < 0}
		<div class="now-page__void">
			<p>Nog even geduld… Lowlands begint vrijdag om {days[0].start.substring(11, 16)}.</p>
		</div>
	{:else if now > TOTAL_MINUTES}
		<div class="now-page__void">
			<p>Dat was &rsquo;m weer. Tot volgend jaar!</p>
		</div>
	{:else}
		<h2 class="now-page__header">Nu</h2>
		{#each onNow as slot (slot.id)}
			<button class="slot" onclick={() => ui.activeArtistId = slot.artistId}>
				<span class="slot__progress" style="width: {((now - slot.startMin) / (slot.endMin - slot.startMin)) * 100}%;"></span>
				<span class="slot__title">{artistById.get(slot.artistId)?.title}</span>
				<span class="slot__meta">{venueTitle(slot.venueId)} &middot; tot {slot.end.substring(11, 16)}</span>
			</button>
		{:else}
			<p class="now-page__none">Nu niks, lekker chillen.</p>
		{/each}

		<h2 class="now-page__header">Komend uur</h2>
		{#each upcoming as slot (slot.id)}
			<button class="slot" onclick={() => ui.activeArtistId = slot.artistId}>
				<span class="slot__title">{artistById.get(slot.artistId)?.title}</span>
				<span class="slot__meta">{venueTitle(slot.venueId)} &middot; {slot.start.substring(11, 16)}</span>
				<span class="slot__in">over {slot.startMin - now} min</span>
			</button>
		{:else}
			<p class="now-page__none">Niks meer in het komende uur.</p>
		{/each}
	{/if}
</div>

{#if activeArtist}
	<ArtistModal artist={activeArtist} onclose={() => ui.activeArtistId = null} />
{/if}

<style>
	.now-page {
		flex-grow: 1;
		overflow-y: auto;
		border: 1px solid black;
		background-color: white;
	}

	.now-page__header {
		position: sticky;
		top: 0;
		margin: 0;
		background-color: antiquewhite;
		border-bottom: 2px solid black;
		font-family: 'ChicagoFLF';
		font-size: 13px;
		letter-spacing: 2px;
		text-transform: uppercase;
		padding: 6px 12px;
		z-index: 2;
	}

	.slot {
		appearance: none;
		font: inherit;
		background: white;
		border: none;
		border-bottom: 1px solid black;
		width: 100%;
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1px;
		padding: 8px 12px;
		text-align: left;
		cursor: pointer;
	}

	/* how far into the set we are, as a fill behind the text */
	.slot__progress {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		background-color: antiquewhite;
		border-right: 2px solid #d0342c;
	}

	.slot__title {
		font-weight: bold;
		font-size: 14px;
		position: relative;
	}

	.slot__meta {
		font-family: 'ChicagoFLF';
		font-size: 11px;
		position: relative;
	}

	.slot__in {
		position: absolute;
		top: 8px;
		right: 12px;
		font-family: 'ChicagoFLF';
		font-size: 11px;
		color: #d0342c;
	}

	.now-page__none {
		margin: 0;
		padding: 10px 12px;
		font-size: 13px;
		color: #666;
		border-bottom: 1px solid black;
	}

	.now-page__void {
		text-align: center;
		padding: 40px 20px;
	}
</style>

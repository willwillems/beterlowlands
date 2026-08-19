<script>
	import { onMount } from 'svelte'
	import events from '$lib/data/events.json'
	import venues from '$lib/data/stages.json'
	import artists from '$lib/data/artists.json'
	import EventCell from './EventCell.svelte'
	import {
		SLOT_WIDTH, STAGE_COL_WIDTH, TOTAL_SLOTS,
		minutesSinceStart, minutesToX, nowInAmsterdam, dayIndexAt, days, timeLabel, overlaps,
	} from '$lib/schedule'
	import { ui, favorites, isFavorite } from '$lib/state.svelte.js'

	let { scroller = $bindable(null), ondaychange, onopen } = $props()

	const artistById = new Map(artists.map(a => [a.id, a]))
	const venueIds = Object.keys(events)
	const venueTitle = id => (venues.find(v => v.id == id) || {}).title

	const cells = venueIds.flatMap((venueId, row) =>
		events[venueId].map(event => ({
			...event,
			gridRow: row + 2,
			colStart: Math.round(minutesSinceStart(event.start) / 5) + 2,
			colSpan: Math.round((minutesSinceStart(event.end) - minutesSinceStart(event.start)) / 5),
		}))
	)

	const headerSlots = Array.from({ length: TOTAL_SLOTS / 6 }, (_, i) => i * 6)
	const dayStartSlots = days.slice(1).map(day => minutesSinceStart(day.start) / 5)

	// Overlapping slots between two favorited acts
	const clashIds = $derived.by(() => {
		const favs = cells.filter(cell => favorites.list.includes(cell.artistId))
		return new Set(favs.filter(a => favs.some(b => b.id !== a.id && overlaps(a, b))).map(cell => cell.id))
	})

	let nowMinutes = $state(-1)
	const tick = () => nowMinutes = minutesSinceStart(nowInAmsterdam())

	onMount(() => {
		tick()
		const interval = setInterval(tick, 30_000)
		// During the festival, land the viewer on "now"
		if (nowMinutes > 0 && nowMinutes < TOTAL_SLOTS * 5) {
			scroller.scrollLeft = Math.max(0, minutesToX(nowMinutes) - scroller.clientWidth / 3)
		}
		return () => clearInterval(interval)
	})

	const scrollHandler = () => {
		const minutes = ((scroller.scrollLeft + scroller.clientWidth / 3) / SLOT_WIDTH) * 5
		ondaychange?.(dayIndexAt(minutes))
	}
</script>

<div class="timetable" bind:this={scroller} onscroll={scrollHandler}>
	<div class="grid" style="grid-template-columns: {STAGE_COL_WIDTH}px repeat({TOTAL_SLOTS}, {SLOT_WIDTH}px); grid-template-rows: 36px repeat({venueIds.length}, 46px);">
		<div class="gridlines" style="grid-column: 2 / -1; grid-row: 2 / -1;"></div>

		{#each dayStartSlots as slot}
			<div class="day-line" style="grid-column: {slot + 2}; grid-row: 1 / -1;"></div>
		{/each}

		{#if nowMinutes >= 0 && nowMinutes <= TOTAL_SLOTS * 5}
			<div class="now-line" style="grid-column: {Math.floor(nowMinutes / 5) + 2}; grid-row: 1 / -1; transform: translateX({((nowMinutes % 5) / 5) * SLOT_WIDTH}px);"></div>
		{/if}

		{#each cells as cell (cell.id)}
			<EventCell
				{cell}
				artist={artistById.get(cell.artistId)}
				fav={isFavorite(cell.artistId)}
				clash={clashIds.has(cell.id)}
				dimmed={ui.favoritesOnly && !isFavorite(cell.artistId)}
				onclick={() => onopen?.(cell.artistId)}
			/>
		{/each}

		{#each headerSlots as slot}
			<div class="time-header" style="grid-column: {slot + 2} / span 6; grid-row: 1;">{timeLabel(slot)}</div>
		{/each}

		{#each venueIds as venueId, row}
			<div class="stage-name" style="grid-column: 1; grid-row: {row + 2};">{venueTitle(venueId)}</div>
		{/each}

		<div class="corner" style="grid-column: 1; grid-row: 1;"></div>
	</div>
</div>

<style>
	.timetable {
		overflow: auto;
		flex-grow: 1;
		border: 1px solid black;
		background-color: white;
	}

	.grid {
		display: grid;
		width: max-content;
	}

	.gridlines {
		pointer-events: none;
		/* hour lines land on :00 (grid starts at 10:30 → first hour line after 30 min) */
		background-image:
			repeating-linear-gradient(to right, transparent 0 142px, #ece2d0 142px 144px),
			repeating-linear-gradient(to bottom, transparent 0 45px, #ece2d0 45px 46px);
		background-position: -72px 0;
	}

	.day-line {
		pointer-events: none;
		border-left: 2px dashed #b5a488;
		z-index: 1;
	}

	.now-line {
		pointer-events: none;
		width: 2px;
		background-color: #d0342c;
		z-index: 3;
	}

	.time-header {
		position: sticky;
		top: 0;
		background-color: antiquewhite;
		border-bottom: 2px solid black;
		padding: 6px 5px;
		font-size: 13px;
		text-align: left;
		z-index: 4;
	}

	.stage-name {
		position: sticky;
		left: 0;
		background-color: antiquewhite;
		border-right: 2px solid black;
		font-family: 'ChicagoFLF';
		font-size: 10px;
		font-weight: bold;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2px 5px;
		z-index: 4;
	}

	.corner {
		position: sticky;
		top: 0;
		left: 0;
		background-color: antiquewhite;
		border-right: 2px solid black;
		border-bottom: 2px solid black;
		z-index: 5;
	}
</style>

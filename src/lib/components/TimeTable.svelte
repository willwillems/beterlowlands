<script>
	import { onMount } from 'svelte'
	import events from '$lib/data/events.json'
	import venues from '$lib/data/stages.json'
	import artists from '$lib/data/artists.json'
	import EventCell from './EventCell.svelte'
	import {
		SLOT_WIDTH, STAGE_COL_WIDTH, TOTAL_SLOTS,
		minutesSinceStart, minutesToX, nowInAmsterdam, dayIndexAt, days, timeLabel,
	} from '$lib/schedule'
	import { ui, favorites, isFavorite, scrollToEvent } from '$lib/state.svelte.js'

	let { scroller = $bindable(null), onprogress, onopen } = $props()

	const HEADER_HEIGHT = 36
	const ROW_HEIGHT = 46

	const artistById = new Map(artists.map(a => [a.id, a]))
	const venueIds = Object.keys(events)
	const venueTitle = id => (venues.find(v => v.id == id) || {}).title

	// row/column span that also covers the stretchy filler row at the bottom
	const fillerRow = venueIds.length + 2
	const gridWidth = STAGE_COL_WIDTH + TOTAL_SLOTS * SLOT_WIDTH
	const gridHeight = HEADER_HEIGHT + venueIds.length * ROW_HEIGHT

	const cells = venueIds.flatMap((venueId, row) =>
		events[venueId].map(event => ({
			...event,
			gridRow: row + 2,
			colStart: Math.round(minutesSinceStart(event.start) / 5) + 2,
			colSpan: Math.round((minutesSinceStart(event.end) - minutesSinceStart(event.start)) / 5),
		}))
	)

	const headerSlots = Array.from({ length: TOTAL_SLOTS / 6 }, (_, i) => i * 6)
	// one mark per full hour (grid starts at :30, so the first is 6 slots in)
	const hourSlots = Array.from({ length: Math.floor((TOTAL_SLOTS - 6) / 12) + 1 }, (_, i) => 6 + i * 12)
	const dayStartSlots = days.slice(1).map(day => minutesSinceStart(day.start) / 5)

	// Marching-ants paths connecting favorited slots, one smooth curve per day
	const antPaths = $derived.by(() => {
		if (!ui.favoritesOnly) return []
		const byDay = new Map()
		for (const cell of cells) {
			if (!favorites.list.includes(cell.artistId)) continue
			const day = dayIndexAt(minutesSinceStart(cell.start))
			if (!byDay.has(day)) byDay.set(day, [])
			byDay.get(day).push(cell)
		}
		return [...byDay.values()].map(dayCells => {
			const points = dayCells
				.sort((a, b) => a.start.localeCompare(b.start))
				.map(cell => ({
					x: STAGE_COL_WIDTH + (cell.colStart - 2 + cell.colSpan / 2) * SLOT_WIDTH,
					y: HEADER_HEIGHT + (cell.gridRow - 2) * ROW_HEIGHT + ROW_HEIGHT / 2,
				}))
			if (points.length < 2) return null
			let d = `M ${points[0].x} ${points[0].y}`
			for (let i = 1; i < points.length; i++) {
				const dx = (points[i].x - points[i - 1].x) / 2
				d += ` C ${points[i - 1].x + dx} ${points[i - 1].y}, ${points[i].x - dx} ${points[i].y}, ${points[i].x} ${points[i].y}`
			}
			return d
		}).filter(Boolean)
	})

	let nowMinutes = $state(-1)
	const tick = () => nowMinutes = minutesSinceStart(nowInAmsterdam())

	const SCROLL_KEY = 'beterlowlands:scrollLeft'
	let saveTimer

	onMount(() => {
		tick()
		const interval = setInterval(tick, 30_000)
		const saved = localStorage.getItem(SCROLL_KEY)
		if (saved !== null) {
			scroller.scrollLeft = Number(saved)
		} else if (nowMinutes > 0 && nowMinutes < TOTAL_SLOTS * 5) {
			// During the festival, land a first-time viewer on "now"
			scroller.scrollLeft = Math.max(0, minutesToX(nowMinutes) - scroller.clientWidth / 3)
		}
		if (ui.pendingEventId) {
			// a modal slot link navigated here: land on that slot instead
			scrollToEvent(ui.pendingEventId)
			ui.pendingEventId = null
		}
		reportProgress()
		return () => { clearInterval(interval); clearTimeout(saveTimer) }
	})

	const reportProgress = () => {
		onprogress?.(((scroller.scrollLeft + scroller.clientWidth / 3) / SLOT_WIDTH) * 5)
	}

	const scrollHandler = () => {
		reportProgress()
		clearTimeout(saveTimer)
		saveTimer = setTimeout(() => localStorage.setItem(SCROLL_KEY, String(Math.round(scroller.scrollLeft))), 150)
	}
</script>

<div class="timetable" bind:this={scroller} onscroll={scrollHandler}>
	<div class="grid" style="grid-template-columns: {STAGE_COL_WIDTH}px repeat({TOTAL_SLOTS}, {SLOT_WIDTH}px); grid-template-rows: {HEADER_HEIGHT}px repeat({venueIds.length}, {ROW_HEIGHT}px);">
		{#each hourSlots as slot}
			<div class="hour-line" style="grid-column: {slot + 2}; grid-row: 2 / span {venueIds.length + 1};"></div>
		{/each}

		{#each dayStartSlots as slot}
			<div class="day-line" style="grid-column: {slot + 2}; grid-row: 1 / span {venueIds.length + 2};"></div>
		{/each}

		{#if nowMinutes >= 0 && nowMinutes <= TOTAL_SLOTS * 5}
			<div class="now-line" style="grid-column: {Math.floor(nowMinutes / 5) + 2}; grid-row: 1 / span {venueIds.length + 2}; transform: translateX({((nowMinutes % 5) / 5) * SLOT_WIDTH}px);"></div>
		{/if}

		{#each cells as cell (cell.id)}
			<EventCell
				{cell}
				artist={artistById.get(cell.artistId)}
				fav={isFavorite(cell.artistId)}
				dimmed={ui.favoritesOnly && !isFavorite(cell.artistId)}
				onclick={() => onopen?.(cell.artistId)}
			/>
		{/each}

		{#if antPaths.length}
			<svg class="ants" width={gridWidth} height={gridHeight} viewBox="0 0 {gridWidth} {gridHeight}" aria-hidden="true">
				{#each antPaths as d}
					<path class="ants__halo" {d}/>
					<path class="ants__dash" {d}/>
				{/each}
			</svg>
		{/if}

		{#each headerSlots as slot}
			<div class="time-header" style="grid-column: {slot + 2} / span 6; grid-row: 1;">{timeLabel(slot)}</div>
		{/each}

		{#each venueIds as venueId, row}
			<div class="stage-name" style="grid-column: 1; grid-row: {row + 2};">{venueTitle(venueId)}</div>
		{/each}

		<!-- keeps the stage-column divider running to the bottom edge -->
		<div class="stage-filler" style="grid-column: 1; grid-row: {fillerRow};"></div>

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
		min-height: 100%;
		position: relative;
	}

	.hour-line {
		pointer-events: none;
		border-left: 1px dotted #b3b3b3;
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

	.ants {
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
		z-index: 3;
	}

	.ants path {
		fill: none;
		stroke-linecap: round;
	}

	.ants__halo {
		stroke: white;
		stroke-width: 4;
	}

	.ants__dash {
		stroke: black;
		stroke-width: 2;
		stroke-dasharray: 8 6;
		animation: march 0.8s linear infinite;
	}

	@keyframes march {
		to { stroke-dashoffset: -14; }
	}

	@media (prefers-reduced-motion: reduce) {
		.ants__dash { animation: none; }
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

	.stage-filler {
		position: sticky;
		left: 0;
		background-color: antiquewhite;
		border-right: 2px solid black;
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

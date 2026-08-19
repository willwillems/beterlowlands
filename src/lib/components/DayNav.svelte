<script>
	import { days, minutesSinceStart, TOTAL_HOURS } from '$lib/schedule'
	import { ui, favorites } from '$lib/state.svelte.js'

	let { scrollMinutes = 0, activeDay, onjump } = $props()

	// Each day is an equal-width segment; the cursor moves through a
	// segment proportionally to how far into that day you've scrolled.
	const TOTAL_MINUTES = TOTAL_HOURS * 60
	const bounds = [...days.map(day => minutesSinceStart(day.start)), TOTAL_MINUTES]

	const cursorFrac = $derived.by(() => {
		const t = Math.max(0, Math.min(TOTAL_MINUTES, scrollMinutes))
		for (let i = 0; i < days.length; i++) {
			if (t < bounds[i + 1] || i === days.length - 1) {
				return (i + (t - bounds[i]) / (bounds[i + 1] - bounds[i])) / days.length
			}
		}
		return 0
	})
</script>

<div class="day-nav">
	<div class="minimap">
		{#each days as day, i}
			<button class="minimap__segment" class:active={activeDay === i} onclick={() => onjump?.(i)}>
				{day.label}
			</button>
		{/each}
		<div class="minimap__cursor" style="left: {Math.min(cursorFrac, 1) * 100}%;"></div>
	</div>
	<button
		class="day-nav__fav"
		class:active={ui.favoritesOnly}
		aria-pressed={ui.favoritesOnly}
		title="Alleen favorieten"
		onclick={() => ui.favoritesOnly = !ui.favoritesOnly}
	>
		{ui.favoritesOnly ? '★' : '☆'}{#if favorites.list.length}&nbsp;{favorites.list.length}{/if}
	</button>
</div>

<style>
	.day-nav {
		width: 100%;
		display: flex;
		flex-direction: row;
		align-items: stretch;
		height: 40px;
		padding: 0;
		border: solid 1px black;
	}

	.minimap {
		flex: 1;
		display: flex;
		position: relative;
	}

	.minimap__segment {
		flex: 1;
		appearance: none;
		font-family: 'ChicagoFLF';
		font-size: 13px;
		background: #d2d2d2;
		border: none;
		border-right: 2px solid black;
		padding: 0;
		cursor: pointer;
	}

	.minimap__segment:last-of-type {
		border-right: none;
	}

	.minimap__segment.active {
		background: white;
	}

	.minimap__cursor {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 2px;
		margin-left: -1px;
		background: black;
		pointer-events: none;
	}

	.day-nav__fav {
		appearance: none;
		font-family: 'ChicagoFLF';
		font-size: 13px;
		background: none;
		border: none;
		border-left: 2px solid black;
		padding: 0 12px;
		cursor: pointer;
	}

	.day-nav__fav.active {
		font-weight: bold;
	}
</style>

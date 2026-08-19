<script>
	import { days } from '$lib/schedule'
	import { ui, favorites } from '$lib/state.svelte.js'

	let { activeDay, onjump } = $props()
</script>

<div class="day-nav">
	{#each days as day, i}
		<button class="day-nav__button" class:active={activeDay === i && !ui.favoritesOnly} onclick={() => onjump?.(i)}>
			{day.label}
		</button>
	{/each}
	<button
		class="day-nav__button day-nav__fav"
		class:active={ui.favoritesOnly}
		aria-pressed={ui.favoritesOnly}
		title="Alleen favorieten"
		onclick={() => ui.favoritesOnly = !ui.favoritesOnly}
	>
		★{#if favorites.list.length} {favorites.list.length}{/if}
	</button>
</div>

<style>
	.day-nav {
		width: 100%;
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		gap: 8px;
		height: 40px;
		padding: 3px 10px;
		border: solid 1px black;
	}

	.day-nav__button {
		font-family: 'ChicagoFLF';
		font-size: 13px;
		background: white;
		border: 2px solid black;
		padding: 2px 12px;
		cursor: pointer;
	}

	.day-nav__button.active {
		background: black;
		color: white;
	}

	.day-nav__fav {
		margin-left: auto;
	}
</style>

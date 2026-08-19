<script>
	import artists from '$lib/data/artists.json'
	import { ui, scrollToArtist } from '$lib/state.svelte.js'

	let query = $state('')

	const norm = s => (s || '').toLowerCase()
	const results = $derived(
		query.trim().length < 2 ? [] : artists
			.filter(artist =>
				[artist.title, artist.style, artist.category, ...(artist.genres || [])]
					.some(field => norm(field).includes(norm(query)))
			)
			.slice(0, 30)
	)

	const pick = artist => {
		ui.searchOpen = false
		ui.activeArtistId = artist.id
		scrollToArtist(artist.id)
	}
</script>

<svelte:window onkeydown={e => e.key === 'Escape' && (ui.searchOpen = false)} />

<div class="search">
	<!-- svelte-ignore a11y_autofocus -->
	<input
		class="search__input"
		type="search"
		placeholder="Zoek een act, genre of categorie…"
		bind:value={query}
		autofocus
	/>
	<ul class="search__results">
		{#each results as artist (artist.id)}
			<li>
				<button class="search__result" onclick={() => pick(artist)}>
					{#if artist.hasImage}
					<img class="search__img" src="/data/images/{artist.id}.jpg" alt=""/>
					{/if}
					<span class="search__title">{artist.title}</span>
					{#if artist.category}<span class="search__category">{artist.category}</span>{/if}
				</button>
			</li>
		{:else}
			{#if query.trim().length >= 2}
				<li class="search__empty">Niks gevonden…</li>
			{/if}
		{/each}
	</ul>
</div>

<style>
	.search {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: white;
		z-index: 20;
		display: flex;
		flex-direction: column;
	}

	.search__input {
		font: inherit;
		font-family: 'ChicagoFLF';
		font-size: 14px;
		padding: 10px;
		border: none;
		border-bottom: 2px solid black;
		outline: none;
	}

	.search__results {
		list-style: none;
		margin: 0;
		padding: 0;
		overflow-y: auto;
	}

	.search__result {
		appearance: none;
		font: inherit;
		background: white;
		border: none;
		border-bottom: 1px solid black;
		width: 100%;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 10px 4px 0;
		text-align: left;
		cursor: pointer;
		font-size: 13px;
	}

	.search__img {
		width: 60px;
		height: 34px;
		object-fit: cover;
		flex-shrink: 0;
	}

	.search__title {
		font-weight: bold;
	}

	.search__category {
		margin-left: auto;
		font-size: 10px;
		font-family: 'ChicagoFLF';
		color: #666;
	}

	.search__empty {
		padding: 10px;
		font-size: 13px;
	}
</style>

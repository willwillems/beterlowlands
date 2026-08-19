<script>
	import artists from '$lib/data/artists.json'
	import ArtistModal from '$lib/components/ArtistModal.svelte'
	import { ui } from '$lib/state.svelte.js'

	const activeArtist = $derived(artists.find(artist => artist.id === ui.activeArtistId) ?? null)

	// Deterministic jitter from the artist id, so server and client render
	// the same scatter (Math.random would break hydration).
	const rand = seed => {
		const x = Math.sin(seed) * 10000
		return x - Math.floor(x)
	}

	const ICON_W = 110
	const CELL_W = 150
	const CELL_H = 130
	const COLS = 16
	const ROWS = Math.ceil(artists.length / COLS)
	const CANVAS_W = COLS * CELL_W + 60
	const CANVAS_H = ROWS * CELL_H + 60

	let icons = $state(artists.map((artist, i) => ({
		artist,
		x: 20 + (i % COLS) * CELL_W + rand(artist.id * 1.7) * (CELL_W - ICON_W - 20),
		y: 20 + Math.floor(i / COLS) * CELL_H + rand(artist.id * 2.3) * 36,
		z: 1,
	})))

	let topZ = $state(2)
	let drag = null

	const down = (e, icon) => {
		drag = { icon, startX: e.clientX, startY: e.clientY, iconX: icon.x, iconY: icon.y, moved: false }
		icon.z = topZ++
		e.currentTarget.setPointerCapture(e.pointerId)
	}

	const move = e => {
		if (!drag) return
		const dx = e.clientX - drag.startX
		const dy = e.clientY - drag.startY
		if (Math.abs(dx) > 5 || Math.abs(dy) > 5) drag.moved = true
		drag.icon.x = Math.max(0, Math.min(CANVAS_W - ICON_W, drag.iconX + dx))
		drag.icon.y = Math.max(0, Math.min(CANVAS_H - 90, drag.iconY + dy))
	}

	const up = () => {
		if (drag && !drag.moved) ui.activeArtistId = drag.icon.artist.id
		drag = null
	}
</script>

<svelte:head>
	<title>Artists</title>
</svelte:head>

<div class="canvas-scroller">
	<div class="canvas" style="width: {CANVAS_W}px; height: {CANVAS_H}px;">
		{#each icons as icon (icon.artist.id)}
			<button
				class="icon"
				style="left: {icon.x}px; top: {icon.y}px; z-index: {icon.z};"
				onpointerdown={e => down(e, icon)}
				onpointermove={move}
				onpointerup={up}
				onpointercancel={() => drag = null}
			>
				{#if icon.artist.hasImage}
					<img src="/data/images/{icon.artist.id}.jpg" alt="" draggable="false"/>
				{:else}
					<span class="icon__placeholder">{icon.artist.title.substring(0, 1)}</span>
				{/if}
				<span class="icon__title">{icon.artist.title}</span>
			</button>
		{/each}
	</div>
</div>

{#if activeArtist}
	<ArtistModal artist={activeArtist} onclose={() => ui.activeArtistId = null} />
{/if}

<style>
	.canvas-scroller {
		flex-grow: 1;
		overflow: auto;
		border: 1px solid black;
	}

	.canvas {
		position: relative;
		/* classic desktop-pattern dot grid */
		background-color: white;
		background-image: radial-gradient(#c9c9c9 1px, transparent 1px);
		background-size: 8px 8px;
	}

	.icon {
		appearance: none;
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		position: absolute;
		width: 110px;
		cursor: grab;
		touch-action: none;
		user-select: none;
		-webkit-user-select: none;
	}

	.icon:active {
		cursor: grabbing;
	}

	.icon img {
		display: block;
		width: 100%;
		height: 62px;
		object-fit: cover;
		border: 2px solid black;
		background: white;
		pointer-events: none;
	}

	.icon__placeholder {
		display: block;
		width: 100%;
		height: 62px;
		line-height: 58px;
		text-align: center;
		font-family: 'ChicagoFLF';
		font-size: 28px;
		border: 2px solid black;
		background: white;
	}

	.icon__title {
		display: block;
		text-align: center;
		font-family: 'ChicagoFLF';
		font-size: 10px;
		line-height: 1.3;
		margin-top: 3px;
		word-break: break-word;
		background: white;
	}
</style>

<script>
	let { cell, artist, fav, clash, dimmed, onclick } = $props()

	const artistNameMarquee = (artistName, cols) => {
		const realCols = Math.max(cols - 4, 0) // image takes up four
		const nameThatFits = artistName.substring(0, realCols * 3)
		if (nameThatFits === artistName) return artistName
		return `${nameThatFits}...`
	}
</script>

<button
	class="event-cell"
	class:dimmed
	class:clash
	class:fav
	style="grid-row: {cell.gridRow}; grid-column: {cell.colStart} / span {cell.colSpan};"
	data-artist-id={artist.id}
	data-event-id={cell.id}
	{onclick}
>
	{#if artist.hasImage}
	<img src="/data/images/{artist.id}.jpg" alt="" class="event-cell__img"/>
	{/if}
	<span class="event-cell__artist-title">{#if fav}★ {/if}{artistNameMarquee(artist.title, cell.colSpan)}</span>
	<br/>
	<span class="event-cell__time">{cell.start.substring(11, 16)} - {cell.end.substring(11, 16)}</span>
</button>

<style>
	.event-cell {
		appearance: none;
		font: inherit;
		text-align: left;
		background-color: white;
		border: 2px solid black;
		margin: 1px; /* acts never touch, like the old table's border-spacing */
		padding: 0;
		white-space: nowrap;
		font-size: 12px;
		cursor: pointer;
		z-index: 2;
	}

	.event-cell.dimmed {
		opacity: 0.25;
		filter: grayscale(1);
	}

	.event-cell.clash {
		border-color: #d0342c;
		box-shadow: inset 0 0 0 1px #d0342c;
	}

	.event-cell__img {
		height: 40px; /* row height minus the cell borders and margin */
		width: auto;
		object-fit: cover;
		float: left;
	}

	.event-cell__artist-title {
		position: sticky;
		left: 71px; /* stage column width + breathing room */
		color: black;
		vertical-align: middle;
		margin: 0 3px;
		font-weight: bold;
	}

	.event-cell__time {
		position: sticky;
		left: 71px;
		color: black;
		vertical-align: middle;
		margin: 0 3px;
	}
</style>

<script>
	let { onnavigate } = $props()

	const menuItems = [
		{ title: 'Blokkenschema', link: '/' },
		{ title: 'Data', link: '/data' },
		{ title: 'Artists', link: '' },
		{ title: 'About', link: '' },
		{ title: 'Studio', link: '' },
		{ title: 'Contact', link: '' },
	]
</script>

<div class="menu">
	{#each menuItems as item}
		<a class="menu-tile" class:disabled={!item.link} href={item.link} onclick={onnavigate}>
			{ item.title }
		</a>
	{/each}
</div>

<style>
	/* Overlays everything below the nav bar; 2×3 tile grid at every size */
	.menu {
		position: absolute;
		top: 50px;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 15;
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: repeat(3, 1fr);
	}

	.menu-tile {
		background-color: white;
		border: solid 1px black;
		padding: 20px 30px;
		margin: 0;
		display: flex;
		align-items: flex-start;
	}

	.menu-tile.disabled {
		background-color: gainsboro;
	}
</style>

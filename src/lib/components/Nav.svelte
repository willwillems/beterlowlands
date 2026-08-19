<script>
	import artists from '$lib/data/artists.json'

	let { title, menuIsActive = $bindable() } = $props()

	const searchEvent = () => {
		const query = prompt('Search: ')
		if (!query) return
		const artist = artists.find(a => a.title.toLowerCase().includes(query.toLowerCase()))
		if (!artist) return
		document.getElementById(artist.id)
			?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
	}
</script>

<nav class="nav">
	<button class="nav__button" onclick={() => menuIsActive = !menuIsActive}>
		<img class="nav__icon" src="/icons/menu.svg" alt="menu"/>
	</button>
	<h1 class="nav__title"> {title} </h1>
	<button class="nav__button" onclick={searchEvent}>
		<img class="nav__icon" src="/icons/eye.svg" alt="search"/>
	</button>
</nav>

<style>
	.nav {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		height: 50px;
		padding: 3px 10px;
		border: solid 1px black;
	}

	.nav__title {
		font-size: 1rem;
		margin: 0;
		padding: 0;
	}

	.nav__button {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
	}

	.nav__icon {
		height: 14px;
		width: 16px;
		display: block;
	}
</style>

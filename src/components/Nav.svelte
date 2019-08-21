<script>
	export let title;
	export let menuIsActive;
	export let tvIsActive;

	const artists = require('../../static/data/artists.json')

	const toggleTv = () => {
		tvIsActive = !tvIsActive
		window.setTimeout(() => tvIsActive = !tvIsActive, 5000)
	}

	const searchEvent = () => {
		const query = prompt('Search: ')
		const artistId = artists.find(a => a.title.toLowerCase().includes(query.toLowerCase())).id
		document.getElementById(artistId)
			.scrollIntoView({behavior: "smooth", block: "nearest", inline: "start"})
	}
</script>

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

	.nav__icon {
		height: 14px;
		width: 16px;
	}
</style>

<nav class="nav" >
	<img class="nav__icon" src="/icons/menu.svg" alt="menu" on:click="{() => menuIsActive = !menuIsActive}"/>
	<h1 class="nav__title" alt="menu icon"> {title} </h1>
	<img class="nav__icon" src="/icons/eye.svg" alt="fireworks icon" on:click="{searchEvent}"/>
</nav>
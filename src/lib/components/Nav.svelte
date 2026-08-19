<script>
	import { ui } from '$lib/state.svelte.js'

	let { title, menuIsActive = $bindable() } = $props()
</script>

<nav class="nav">
	<button class="nav__button" aria-label="menu" onclick={() => menuIsActive = !menuIsActive}>
		<img class="nav__icon" src="/icons/menu.svg" alt=""/>
	</button>
	<h1 class="nav__title"> {title} </h1>
	<button class="nav__button" aria-label="zoeken" onclick={() => ui.searchOpen = !ui.searchOpen}>
		<img class="nav__icon" src="/icons/eye.svg" alt=""/>
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

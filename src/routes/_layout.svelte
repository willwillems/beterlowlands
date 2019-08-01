<script>
	import Menu from '../components/Menu.svelte'
	import Nav from '../components/Nav.svelte';

	let menuIsActive = false

	export let segment;
</script>

<style>
	#app {
		border: 1px solid black;
	}

	main {
		background-color: white;
		overflow-y: scroll;
		position: relative;
	}

	@media (min-width: 600px) {
		#app {
			width: 360px;
			height: 582px;
			margin: 80px auto;
		}
	}
</style>

<div id="app">
	<Nav title="blokkenschema" bind:menuIsActive ></Nav>
	{#if menuIsActive} <Menu></Menu> {/if}
	<main>
		<slot></slot>
	</main>
</div>
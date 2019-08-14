<script>
	import Menu from '../components/Menu.svelte'
	import Nav from '../components/Nav.svelte';

	let menuIsActive = false
	let tvIsActive = false

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
		height: calc(100vh - 50px);
		display: flex;
		flex-direction: column;
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
	<Nav title="blokkenschema" bind:menuIsActive bind:tvIsActive ></Nav>
	{#if menuIsActive} <Menu></Menu> {/if}
	<main>
		<slot></slot>
	</main>
	{#if tvIsActive}
		<img on:click="{() => tvIsActive = !tvIsActive}" src="https://media.giphy.com/media/Ph0oIVQeuvh0k/giphy.gif" alt="S T A T I C" style="position: fixed; top: 0; right: 0; bottom: 0; left: 0; height: 100%; width: 100%; object-fit: cover; z-index: 100;"/>
	{/if}
</div>

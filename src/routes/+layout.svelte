<script>
	import Menu from '$lib/components/Menu.svelte'
	import Nav from '$lib/components/Nav.svelte'

	let { children } = $props()
	let menuIsActive = $state(false)
</script>

<div id="app">
	<Nav title="blokkenschema" bind:menuIsActive />
	{#if menuIsActive} <Menu onnavigate={() => menuIsActive = false} /> {/if}
	<main>
		{@render children()}
	</main>
</div>

<style>
	#app {
		border: 1px solid black;
		overflow-y: scroll;
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

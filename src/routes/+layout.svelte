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
	/* Mobile-first: one full-viewport app frame, identical on desktop */
	#app {
		border: 1px solid black;
		height: 100vh;
		height: 100dvh;
		display: flex;
		flex-direction: column;
		position: relative;
		background-color: white;
	}

	main {
		background-color: white;
		position: relative;
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
</style>

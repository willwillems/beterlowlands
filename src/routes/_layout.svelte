<script>
	import Menu from '../components/Menu.svelte'
	import Nav from '../components/Nav.svelte';

	let menuIsActive = false

	export let segment;
</script>

<style>
	main {
		background-color: white;
		box-sizing: border-box;
		overflow-y: scroll;
		position: relative;
	}
</style>

<Nav title="blokkenschema" bind:menuIsActive ></Nav>
{#if menuIsActive} <Menu></Menu> {/if}
<main>
	<slot></slot>
</main>
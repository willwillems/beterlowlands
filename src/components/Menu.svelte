<script>
  const menuItems = [
    'Blokkenschema', 'Artists', 'Studio', 'About'
  ]
</script>

<style>
	.menu {
    position: absolute;
		display: flex;
    flex-direction: row;
    flex-wrap: wrap;
	}

	.menu-tile {
		width: calc(50vw - 1px);
    height: 50vw;
    background-color: white;
    border: solid 1px black;
    z-index: 10;
    padding: 20px 30px;
	}

</style>

<div class="menu" >
  {#each menuItems as item}
	<div class="menu-tile">
    { item }
  </div>
  {/each}
</div>
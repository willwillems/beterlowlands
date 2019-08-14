<script>
  const menuItems = [
    'Blokkenschema', 'Artists', 'Studio', 'About', '', '' 
  ]
</script>

<style>
	.menu {
    position: absolute;
		display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-content: flex-start;
    width: 100%;
    height: calc(100vh - 50px);
	}

	.menu-tile {
		width: calc(50vw - 1px);
    height: 33%;
    background-color: white;
    border: solid 1px black;
    z-index: 10;
    padding: 20px 30px;
    margin: 0;
  }
  
  @media (min-width: 600px) {
    .menu {
      max-width: 360px;
    }

    .menu-tile {
      width: 180px;
      height: 180px;
    }
  }

</style>

<div class="menu" >
  {#each menuItems as item}
	<div class="menu-tile">
    { item }
  </div>
  {/each}
</div>
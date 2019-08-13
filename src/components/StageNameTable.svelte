<style>
.stage-name-cell {
  background-color: pink;
  text-align: center;
  border: 2px solid black;
  padding: 2px 5px;
  font-weight: bold;
}
</style>

<script>
const events 	= require('../../static/data/events.json')
const venues 	= require('../../static/data/stages.json')
</script>

<table>
  {#each Object.values(events) as stage, i}
		<tr>
			<td class="stage-name-cell">{(venues.find(venue => venue.id == Object.keys(events)[i]) || {}).title}</td>
    </tr>
  {/each}
</table>
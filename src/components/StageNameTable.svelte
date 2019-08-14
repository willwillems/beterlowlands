<style>
.stage-name-cell {
  text-align: center;
  padding: 2px 5px;
  font-weight: bold;
  font-family: 'ChicagoFLF';
  font-size: 10px;
  height: 46px;
}
</style>

<script>
const events 	= require('../../static/data/events.json')
const venues 	= require('../../static/data/stages.json')
</script>

<table>
  <tr><td class="stage-name-cell" style="height: 36px;"></td></tr> <!-- make space for time bar -->
  {#each Object.values(events) as stage, i}
		<tr>
			<td class="stage-name-cell">{(venues.find(venue => venue.id == Object.keys(events)[i]) || {}).title}</td>
    </tr>
  {/each}
</table>
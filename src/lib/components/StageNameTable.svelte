<script>
	import events from '$lib/data/events.json'
	import venues from '$lib/data/stages.json'
</script>

<table>
	<tbody>
		<tr><td class="stage-name-cell" style="height: 36px;"></td></tr> <!-- make space for time bar -->
		{#each Object.keys(events) as venueId}
			<tr>
				<td class="stage-name-cell">{(venues.find(venue => venue.id == venueId) || {}).title}</td>
			</tr>
		{/each}
	</tbody>
</table>

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

<script>
export let event

const artists = require('../../static/data/artists.json')

const artist = artists.find(artist => artist.id === event.artistId)
const artistName = artist.title
const artistInstagram = artist.socialLinkInstagram

const artistNameMarquee = (artistName, cols) => {
	const realCols = Math.max(cols - 4, 0) // image takes up four
	const nameThatFits = artistName.substring(0, realCols * 3)
	if (nameThatFits === artistName) return artistName
	return `${nameThatFits}...`
}

</script>

<td class="event-cell" id="{artist.id}" colspan={event.eventCols} on:click>
  {#if artistInstagram}
  <img src="/data/images/{artist.id}.jpg" alt="" class="event-cell__img"/>
  {/if}
  <span class="event-cell__artist-title">{artistNameMarquee(artistName, event.eventCols)}</span>
  <br/>
  <span class="event-cell__time">{event.start.substring(11,16)} - {event.end.substring(11,16)}</span>
</td>

<style>
	.event-cell {
		background-color: white;
		border: 2px solid black;
		padding: 0;
		height: 46px;
		white-space: nowrap;
		font-size: 12px; /*1rem;*/
	}

	.event-cell__img {
		height: 100%;
		float: left;
	}

	.event-cell__artist-title {
		position: sticky;
		left: 5px;
		color: black;
		vertical-align: middle;
		margin: 0 3px;
		font-weight: bold;
	}

	.event-cell__time {
		position: sticky;
		left: 5px;
		color: black;
		vertical-align: middle;
		margin: 0 3px;
	}
</style>
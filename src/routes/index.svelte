<style>
	@import url('https://fonts.googleapis.com/css?family=Concert+One|Hanalei&display=swap');

	#table-wrapper {
		display: flex;
		align-items: flex-end
	}

	#table-wrapper-stage {
		font-family: "Hanalei";
		position: sticky;
		left: 0px;
		z-index: 10;
	}

	#table-wrapper-shows {
		/* font-family: "Concert One"; */
		width: 100%;
		overflow: scroll;
		border: 1px solid black;
		min-height: 500px;
	}

	.time-header__row {
		text-align: left;
	}

	.time-header__cell {
		padding: 3px 5px;
		width: 70px;
		height: 32px;
		font-weight: normal;
	}

	:global(.event-cell) {
		background-color: white;
		border: 2px solid black;
		height: 32px;
		white-space: nowrap;
	}

	:global(.event-cell__img) {
		height: 100%;
		float: left;
	}

	:global(.event-cell__text) {
		position: sticky;
		left: 5px;
		color: black;
		vertical-align: middle;
		margin: 0 3px;
	}

	.table-spacer {
		height: 0px;
		background-color: black;
	}

</style>

<script>
import StageNameTable from '../components/StageNameTable.svelte';
import TimeTableDayIndicator from '../components/TimeTableDayIndicator.svelte';

const events = require('../data/events.json')
const venues = require('../data/stages.json')
const artists = require('../data/artists.json')

const times = new Array(24 * 2 * 4).fill(0).map((el, i) => new Date(1565944200000 + 1000 * 60 * 30 * i))

const random = function () {
	return Math.max(parseInt(Math.random() * 10), 5)
}

const createEventTimes = (events, eventTimes) => {
	const event = events.shift()
	const eventDuration = new Date(event.end).getTime() - new Date(event.start).getTime()
	const eventCols = eventDuration / 1000 / 60 / 5

	const previousEvent = eventTimes[eventTimes.length - 1] || { end: times[0].toString() }
	const noEventDuration = new Date(event.start).getTime() - new Date(previousEvent.end).getTime()
	const noEventCols = noEventDuration / 1000 / 60 / 5

	eventTimes.push({
		eventCols: noEventCols
	})

	eventTimes.push({
		eventCols,
		...event
	})

	return events.length ? createEventTimes(events, eventTimes) : eventTimes
}

const eventTimes = Object.values(events).map(stageEvents => createEventTimes(stageEvents, []))

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

</script>
	<TimeTableDayIndicator days="{['day 1', 'day 2']}"></TimeTableDayIndicator>
	<div id="table-wrapper">
		<!-- <div id="table-wrapper-stage">
			<StageNameTable/>
		</div> -->
		<div id="table-wrapper-shows">
			<table style="table-layout: fixed ; width: 100%;">
				<thead>
					<tr class="time-header__row">
						{#each times as time, i}
							<th class="time-header__cell" colspan=6>
								<span>{time.toTimeString().substring(0, 5)}</span>
							</th>
						{/each}
					</tr>
					<tr>
						<td class="table-spacer" colspan="100%"></td>
					</tr>
				</thead>
				<tbody>
					{#each eventTimes as stage, i}
						<tr>
							{#each stage as event, i}
								{@html
									((event) => {
										if (!event.id) return event.eventCols ? `<td colspan=${event.eventCols}></td>` : ''
										const artistName = artists.find(artist => artist.id === event.artistId).title
										const artistIdFb = (artists.find(artist => artist.id === event.artistId).socialLinkFacebook || '').split('/')[3]
										return `
											<td class="event-cell" colspan=${event.eventCols} >
												<img src="http://graph.facebook.com/${artistIdFb}/picture?type=square" class="event-cell__img"/>
												<span class="event-cell__text">${artistName} ${event.start.substring(11,16)} - ${event.end.substring(11,16)}</span>
											</td>
										`
									})(event)
									}
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>	
		
		</div>
	</div>

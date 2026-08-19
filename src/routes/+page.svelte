<script>
	import StageNameTable from '$lib/components/StageNameTable.svelte'
	import TimeTableDayIndicator from '$lib/components/TimeTableDayIndicator.svelte'
	import ArtistModal from '$lib/components/ArtistModal.svelte'
	import ArtistEventCell from '$lib/components/ArtistEventCell.svelte'

	import events from '$lib/data/events.json'
	import artists from '$lib/data/artists.json'

	// Lowlands 2026 — Fri 2026-08-21 10:30 CEST
	const times = new Array(24 * 2 * 3).fill(0).map((el, i) => new Date(1787301000000 + 1000 * 60 * 30 * i))
	let activeArtist = $state(null)

	const createEventTimes = (events, eventTimes) => {
		if (!events.length) return []
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

	const eventTimes = Object.values(events).map(stageEvents => createEventTimes([...stageEvents], []))

	const daynames = ['Fri - Dag 1', 'Sat - Dag 2', 'Sun - Dag 3', 'Naar huis 🏡']
	let activeDay = $state(daynames[0])
	const scrollHandler = e => {
		if (e.target.scrollLeft < 3000) { return activeDay = daynames[0] }
		if (e.target.scrollLeft < 6500) { return activeDay = daynames[1] }
		if (e.target.scrollLeft < 10000) { return activeDay = daynames[2] }
		if (e.target.scrollLeft < 13000) { return activeDay = daynames[3] }
	}
</script>

<TimeTableDayIndicator day={activeDay} />
<div id="table-wrapper">
	<div id="table-wrapper-stage">
		<StageNameTable/>
	</div>
	<div id="table-wrapper-shows" onscroll={scrollHandler}>
		<table style="table-layout: fixed; width: 100%;">
			<thead>
				<tr class="time-header__row">
					{#each times as time}
						<th class="time-header__cell" colspan="6">
							<span>{time.toTimeString().substring(0, 5)}</span>
						</th>
					{/each}
				</tr>
				<tr>
					<td class="table-spacer" colspan="870"></td>
				</tr>
			</thead>
			<tbody>
				{#each eventTimes as stage}
					<tr>
						{#each stage as event}
							{#if !event.id}
								<!-- Dont render a cell if it has a 0-width -->
								{#if event.eventCols} <td colspan={event.eventCols}></td> {/if}
							{:else if event}
								<ArtistEventCell {event} onclick={() => activeArtist = artists.find(artist => artist.id === event.artistId)} />
							{/if}
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
<div class="table-filler">
	<div class="table-filler__el" style="width: 65px;"></div>
	<div class="table-filler__el"></div>
</div>
{#if activeArtist}
	<ArtistModal artist={activeArtist} onclose={() => activeArtist = null} />
{/if}

<style>
	#table-wrapper {
		display: flex;
		align-items: flex-end
	}

	#table-wrapper-stage {
		position: sticky;
		width: 66px;
		left: 0px;
		border: 1px solid black;
		z-index: 1;
		border-bottom-width: 0;
	}

	#table-wrapper-shows {
		width: 100%;
		overflow: scroll;
		border: 1px solid black;
		min-height: 500px;
		border-bottom-width: 0;
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

	.table-spacer {
		height: 0px;
		background-color: black;
	}

	.table-filler {
		flex-grow: 1; /* let this el fill up the page */
		display: flex;
		flex-direction: row;
		border-right: 1px solid black;
		border-left: 1px solid black;
	}

	.table-filler__el {
		border-right: 1px solid black;
	}
</style>

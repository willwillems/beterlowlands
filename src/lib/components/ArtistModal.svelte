<script>
	import events from '$lib/data/events.json'
	import venues from '$lib/data/stages.json'
	import { weekdayOf } from '$lib/schedule'
	import { isFavorite, toggleFavorite } from '$lib/state.svelte.js'

	let { artist, onclose } = $props()

	const slots = $derived(
		Object.values(events).flat()
			.filter(event => event.artistId === artist.id)
			.sort((a, b) => a.start.localeCompare(b.start))
	)
	const venueTitle = id => (venues.find(v => v.id === id) || {}).title

	let dialogEl = $state(null)
	$effect(() => { artist; dialogEl?.focus() })
</script>

<svelte:window onkeydown={e => e.key === 'Escape' && onclose()} />

<div class="lightbox" onclick={onclose} aria-hidden="true"></div>
<div class="artist-modal" role="dialog" aria-modal="true" aria-label={artist.title} tabindex="-1" bind:this={dialogEl}>
	<div class="artist-modal__bar">
		<button class="artist-modal__close" aria-label="sluiten" onclick={onclose}></button>
		<div><b>Artist viewer</b></div>
		<button
			class="artist-modal__star"
			aria-pressed={isFavorite(artist.id)}
			title={isFavorite(artist.id) ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
			onclick={() => toggleFavorite(artist.id)}
		>{isFavorite(artist.id) ? '★' : '☆'}</button>
	</div>
	<div class="artist-modal__content">
		{#if artist.hasImage}
		<img class="artist-modal__img" src="/data/images/{artist.id}.jpg" alt={artist.title}/>
		{/if}
		<h1>{ artist.title }</h1>
		{#if artist.style }<b>{ artist.style }</b>{/if}

		<ul class="artist-modal__slots">
			{#each slots as slot}
				<li>
					<b>{weekdayOf(slot.start)}</b>
					{slot.start.substring(11, 16)} – {slot.end.substring(11, 16)}
					· {venueTitle(slot.venueId)}
				</li>
			{/each}
		</ul>

		<div class="artist-modal__description">{@html artist.description}</div>

		{#if artist.youtubeVideoId}
			<iframe
				class="artist-modal__video"
				src="https://www.youtube-nocookie.com/embed/{artist.youtubeVideoId}"
				title="Video: {artist.title}"
				loading="lazy"
				allowfullscreen
				allow="encrypted-media; picture-in-picture"
			></iframe>
		{/if}

		<div class="artist-modal__links">
			{#if artist.socialLinkSpotify }<a href={artist.socialLinkSpotify}>Spotify</a>{/if}
			{#if artist.socialLinkInstagram }<a href={artist.socialLinkInstagram}>Instagram</a>{/if}
			{#if artist.socialLinkFacebook }<a href={artist.socialLinkFacebook}>Facebook</a>{/if}
			{#if artist.socialLinkTwitter }<a href={artist.socialLinkTwitter}>Twitter</a>{/if}
			{#if artist.socialLinkWebsite }<a href={artist.socialLinkWebsite}>Website</a>{/if}
		</div>
	</div>
</div>

<style>
	.lightbox {
		position: fixed;
		top: 0px;
		right: 0px;
		bottom: 0px;
		left: 0px;
		z-index: 99;
	}

	.artist-modal {
		position: fixed;
		top: 40px;
		right: 40px;
		bottom: 40px;
		left: 40px;
		background-color: white;
		border: 2px solid black;
		z-index: 100;
		display: flex;
		flex-direction: column;
	}

	@media (min-width: 600px) {
		.artist-modal {
			max-width: 420px;
			margin: 0 auto;
		}
	}

	.artist-modal__content {
		font-size: 12px;
		line-height: 22px;
		padding: 10px;
		overflow-y: auto;
	}

	.artist-modal__img {
		max-width: 100%;
		display: block;
		margin-bottom: 8px;
	}

	.artist-modal__slots {
		list-style: none;
		margin: 8px 0;
		padding: 6px 8px;
		border: 1px solid black;
		font-family: 'ChicagoFLF';
		font-size: 11px;
	}

	.artist-modal__video {
		width: 100%;
		aspect-ratio: 16 / 9;
		border: 1px solid black;
		margin: 8px 0;
	}

	.artist-modal__links {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		font-family: 'ChicagoFLF';
		font-size: 11px;
	}

	.artist-modal__bar {
		height: 30px;
		flex-shrink: 0;
		text-align: center;
		border-bottom: 2px solid black;
		overflow: hidden;
		font-family: 'ChicagoFLF';
		position: relative;
	}

	.artist-modal__bar > div {
		height: 28px;
		width: 100%;
		background: #ffffff;
		background: linear-gradient(to bottom,  #ffffff 0%,#ffffff 50%,#000000 51%,#000000 100%);
		background-size: 4px 4px;
		position: absolute;
	}

	.artist-modal__bar > div b {
		height: 15px;
		background: white;
		padding: 0 4px;
		line-height: 15px;
		display: inline-block;
		font-size: 13px;
	}

	.artist-modal__close {
		height: 18px;
		width: 18px;
		background: #ffffff;
		border: 2px solid black;
		position: absolute;
		top: 3px;
		left: 3px;
		z-index: 3;
		margin: 2px 14px;
		display: block;
		box-shadow: 0 0 0 2px white;
		cursor: pointer;
	}

	.artist-modal__star {
		height: 22px;
		width: 22px;
		background: #ffffff;
		border: 2px solid black;
		position: absolute;
		top: 3px;
		right: 3px;
		z-index: 3;
		margin: 0 14px;
		display: block;
		box-shadow: 0 0 0 2px white;
		cursor: pointer;
		font-size: 12px;
		line-height: 1;
		padding: 0;
	}
</style>

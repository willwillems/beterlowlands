'use strict'
// Hydrates static/data from the lowlands.nl Wagtail API.
// The old goevent.s3 schedule.zip pipeline died after 2019; the current site
// exposes every act (times, stage, images, socials) at /api/pages/.
// Zero dependencies — requires Node 18+ (native fetch).

const fs = require('fs/promises')
const path = require('path')

const API_BASE = 'https://lowlands.nl'
const PAGE_SIZE = 100
const DATA_DIR = path.join(__dirname, 'static', 'data')
const IMG_DIR = path.join(DATA_DIR, 'images')
const IMG_CONCURRENCY = 8

const fetchJson = async url => {
  const resp = await fetch(url, { headers: { 'User-Agent': 'beterlowlands-hydrate' } })
  if (!resp.ok) throw new Error(`${resp.status} for ${url}`)
  return resp.json()
}

const fetchAllActs = async () => {
  const acts = []
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page = await fetchJson(`${API_BASE}/api/pages/?type=acts.ActPage&fields=*&limit=${PAGE_SIZE}&offset=${offset}`)
    acts.push(...page.items)
    console.info(`fetched ${acts.length}/${page.meta.totalCount} acts`)
    if (acts.length >= page.meta.totalCount) return acts
  }
}

// The API returns UTC timestamps; the app renders naive local strings.
const toLocalDateTime = iso => {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Amsterdam',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).format(new Date(iso))
  return parts // sv-SE locale formats as "YYYY-MM-DD HH:MM:SS"
}

const saveImage = async (url, filePath) => {
  const resp = await fetch(url, { headers: { 'User-Agent': 'beterlowlands-hydrate' } })
  if (!resp.ok) throw new Error(`${resp.status} for ${url}`)
  await fs.writeFile(filePath, Buffer.from(await resp.arrayBuffer()))
}

;(async () => {
  await fs.mkdir(IMG_DIR, { recursive: true })

  const acts = await fetchAllActs()

  const artists = acts.map(act => ({
    id: act.id,
    title: act.title,
    description: act.text || '',
    style: act.subtitle || (act.actGenreItems || []).map(g => g.title).join(', '),
    socialLinkFacebook: act.facebookLink,
    socialLinkTwitter: act.twitterLink,
    socialLinkInstagram: act.instagramLink,
    socialLinkSpotify: act.spotifyLink,
    hasImage: Boolean(act.heroImage),
  }))

  const stages = [...new Map(
    acts.filter(act => act.location).map(act => [act.location.id, act.location])
  ).values()]
    .sort((a, b) => a.position - b.position)
    .map(loc => ({ id: loc.id, title: loc.title, subtitle: '', description: '' }))

  const events = {}
  for (const stage of stages) events[stage.id] = []
  for (const act of acts) {
    if (!act.location) continue
    for (const slot of act.actDateItems || []) {
      events[act.location.id].push({
        artistId: act.id,
        id: slot.id,
        venueId: act.location.id,
        start: toLocalDateTime(slot.startDate),
        end: toLocalDateTime(slot.endDate),
      })
    }
  }
  // A cancelled act's page can linger in the API with a stale time slot (its
  // replacement gets published later). On overlap, keep the newer page.
  const publishedAt = new Map(acts.map(act => [act.id, act.meta.lastPublishedAt]))
  const titleOf = id => acts.find(act => act.id === id).title
  for (const venueId of Object.keys(events)) {
    events[venueId].sort((a, b) => a.start.localeCompare(b.start))
    events[venueId] = events[venueId].filter((event, i, list) => {
      const rival = list.find((other, j) => j !== i && other.start < event.end && event.start < other.end)
      if (!rival) return true
      const keep = publishedAt.get(event.artistId) >= publishedAt.get(rival.artistId)
      if (!keep) console.info(`dropping "${titleOf(event.artistId)}" (overlaps newer "${titleOf(rival.artistId)}")`)
      return keep
    })
    if (!events[venueId].length) delete events[venueId]
  }

  await Promise.all([
    fs.writeFile(path.join(DATA_DIR, 'events.json'), JSON.stringify(events, null, 2)),
    fs.writeFile(path.join(DATA_DIR, 'artists.json'), JSON.stringify(artists, null, 2)),
    fs.writeFile(path.join(DATA_DIR, 'stages.json'), JSON.stringify(stages, null, 2)),
  ])
  console.info(`wrote ${artists.length} artists, ${Object.keys(events).length} stages with shows`)

  const withImage = acts.filter(act => act.heroImage)
  let saved = 0
  const queue = [...withImage]
  await Promise.all(Array.from({ length: IMG_CONCURRENCY }, async () => {
    for (let act; (act = queue.shift()); ) {
      const rendition = act.heroImage.renditions.xs || Object.values(act.heroImage.renditions)[0]
      try {
        await saveImage(`${API_BASE}${rendition.src}`, path.join(IMG_DIR, `${act.id}.jpg`))
        saved++
      } catch (err) {
        console.info(`image failed for ${act.title}: ${err.message}`)
      }
    }
  }))
  console.info(`saved ${saved}/${withImage.length} artist images`)
})()

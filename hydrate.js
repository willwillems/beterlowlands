(async () => {
  'use strict'
  // import libs
  const fs = require('fs').promises
  const unzipper = require('unzipper');
  const fetch = require('node-fetch')
  const sqliteJson = require('sqlite-json');
  const sqlite3 = require('sqlite3');

  const archiveLocation = '/tmp/schedule-archive'
  const scheduleDbName = 'schedule_0.sqlite'

  // get data
  await fetch('https://goevent.s3.amazonaws.com/lowlands/2019/latest/schedule.zip')
    .then(resp => {
      return new Promise((res, rej) => {
        // pipe the response body into an unzipper and store it in temp
        resp.body
          .pipe(unzipper.Extract({ path: archiveLocation }))
          .on('error', rej)
          .on('finish', res);
      })
    })
    .catch(console.error)

  // import data
  const db = new sqlite3.Database(`${archiveLocation}/${scheduleDbName}`)
  const exporter = sqliteJson(db)

  // get all the table data as JSON 
  const getTableAsJSON = table => {
    return new Promise((res, rej) => {
      exporter.json(`select * FROM ${table}`, (err, json) => {
        return err ? rej(err) : res(JSON.parse(json))
      })
    })
  }

  // get filepath for JSON data
  const getFilePath = filename => `./src/data/${filename}`

  getTableAsJSON('Shows')
    // filter out the keys we don't need and change other keys to camelCase
    .then(shows => shows
      .map(show => ({
        artistId: show['object_id'],
        id: show['_id'],
        venueId: show['venue_id'],
        start: `${show['date_start']} ${show['time_start']}`,
        end: `${show['date_end']} ${show['time_end']}`,
      }))
    )
    // group shows by venue ID
    .then(filteredShows => filteredShows
      .reduce((red, show) => ({
        ...red,
        [show.venueId]: [show, ...(red[show.venueId] || [])]
      }), {})
    )
    // sort shows by start date :( JS sort modifies original object
    .then(groupedShows => {
      Object.keys(groupedShows).forEach(key => {
        groupedShows[key].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      })
      return groupedShows
    })
    .then(sortedShows => {
      // save filtered shows
      return fs.writeFile(getFilePath('events.json'), JSON.stringify(sortedShows, null, 2))
    })
    .catch(console.error)

  getTableAsJSON('Artists')
    // filter out the keys we don't need and change other keys to camelCase
    .then(artists => artists
      .map(artist => ({
          id: artist['_id'],
          title: artist['title'],
          description: artist['description'],
          style: artist['style'],
          socialLinkFacebook: artist['link3'],
          socialLinkTwitter: artist['link4'],
          socialLinkInstagram: artist['link6'],
          photoSuffix: artist['photo_suffix'],
        }))
    )
    .then(filteredArtists => {
      return fs.writeFile(getFilePath('artists.json'), JSON.stringify(filteredArtists, null, 2))
    })
    .catch(console.error)

  getTableAsJSON('Venues')
    // filter out the keys we don't need and change other keys to camelCase
    .then(venues => venues
      .map(venue => ({
        id: venue['_id'],
        title: venue['title'],
        subtitle: venue['subtitle'],
        description: venue['description'],
        photoSuffix: venue['photo_suffix'],
      }))
    )
    .then(filteredVenues => {
      return fs.writeFile(getFilePath('stages.json'), JSON.stringify(filteredVenues, null, 2))
    })
    .catch(console.error)
})()

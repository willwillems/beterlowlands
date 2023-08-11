(async () => {
  'use strict'
  // import libs
  const fso = require('fs')
  const fs = require('fs').promises
  const unzipper = require('unzipper');
  const fetch = require('node-fetch');
  const sqliteJson = require('sqlite-json');
  const sqlite3 = require('sqlite3');

  const saveArtistImage = require('./hydrate/getArtistImage.js')

  // define constants
  const scheduleZipUrl = 'https://goevent.s3.amazonaws.com/lowlands/2019/latest/schedule.zip'
  const archiveLocation = '/tmp/schedule-archive'
  const dataDir = 'static/data'
  const imgDir = 'images'
  const scheduleDbName = 'schedule_0.sqlite'

  // get data
  await fetch(scheduleZipUrl)
    .then(resp => {
      return new Promise((res, rej) => {
        console.info('piping the response body into an unzipper and storing it in temp...')
        resp.body
          .pipe(unzipper.Extract({ path: archiveLocation }))
          .on('error', rej)
          .on('finish', res);
      })
    })
    .catch(console.error)

  // get data
  await fetch("https://app.appmiral.com/api/v6/events/lowlands/editions/lowlands2023/artists?include_history=true&max_per_page=50", {
    "headers": {
      "x-protect": "f65e146a223e677b3b44fa133ab0d3ef"
    }
  })
    .then(resp => resp.text())
    .then(text => {
      // save response as file
      return new Promise((res, rej) => {
        console.info('piping the response body into an unzipper and storing it in temp...')
        fs.writeFile('/tmp/file.json', text, err => {
          if (err) {
            console.error('Error saving file:', err);
            rej()
          } else {
            console.log('File saved successfully');
            res()
          }
        });
      })
    })
    .catch(console.error)

  console.info('setting up the sqlite database...')

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
  const getFilePath = filename => `${__dirname}/${dataDir}/${filename}`
  
  // fs does not auto create parent directories when writing to locations with missing ones
  if (!fso.existsSync(`${__dirname}/${dataDir}`)) (console.info(`creating ${dataDir}`), fso.mkdirSync(`${__dirname}/${dataDir}`))
  if (!fso.existsSync(`${__dirname}/${dataDir}/${imgDir}`)) (console.info(`creating ${dataDir}`), fso.mkdirSync(`${__dirname}/${dataDir}/${imgDir}`))

  console.info('processing DB data and exporting to JSON files...')

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
    .then(artists => {
      // write file to disk and use data to fetch images for artists
      return Promise.all([
        fs.writeFile(getFilePath('artists.json'), JSON.stringify(artists, null, 2)),
        Promise.all(artists.map(artist => saveArtistImage(artist.socialLinkInstagram, getFilePath(`${imgDir}/${artist.id}.jpg`))))
      ])
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

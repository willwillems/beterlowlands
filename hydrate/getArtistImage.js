// import libs
const fso = require('fs')
const fetch = require('node-fetch')

const saveImageToDisk = (url, path) => {
  const writeStream = fso.createWriteStream(path)
  return fetch(url)
    .then(resp => new Promise((res, rej) => {
      resp.body.pipe(writeStream)
      resp.body.on('end', res)
      writeStream.on('error', rej)
    }))
}


const getIgProfilePic = (username) => {
  return fetch(`https://www.instagram.com/${username}/?__a=1`)
    .then(resp => resp.json())
    .then(json => json.graphql.user.profile_pic_url_hd || json.graphql.user.profile_pic_url || null)
}

module.exports = function (igLink, path) {
  if (!igLink) return null
  const regexMatch = igLink.match(/instagram\.com\/([0-z]+)/)
  const artistUsername = regexMatch ? regexMatch[1] : console.info(`Could not find profile pic for: ${igLink}`)
  getIgProfilePic(artistUsername)
    .then(url => url ? saveImageToDisk(url, path) : 0)
    .catch(err => console.info(err))
}

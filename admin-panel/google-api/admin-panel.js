if (process.env['NODE_ENV'] !== 'production')
  require('../../common/lib/dotenv').config([
    'GOOGLE_API_CREDENTIALS_FILE',
    'GOOGLE_ADMIN_SPREADSHEET_ID'
  ])

const bb = require('bluebird'),
  { map, filter, compose, propEq } = require('ramda'),
  google = require('googleapis'),
  OAuth2 = google.auth.OAuth2,
  googleTokenModel = require('../models/access-token'),
  googleCredentials = JSON.parse(process.env.GOOGLE_API_CREDENTIALS_FILE)
    .installed

const getAuth = async () => {
  const oauth2Client = new OAuth2(
    googleCredentials['client_id'],
    googleCredentials['client_secret'],
    googleCredentials['redirect_uris'][0]
  )

  oauth2Client.credentials = await googleTokenModel.getAccessToken()

  return oauth2Client
}

const staticTableToObj = row => ({
  myTargetId: parseInt(row[0]),
  impressionsPrediction: row[1] ? parseInt(row[1].replace(/\,/g, '')) : null,
  coveragePrediction: row[2] ? parseInt(row[2].replace(/\,/g, '')) : null,
  ctr: row[3] ? parseFloat(row[3]) : null,
  preview: row[4] || null
})

const dynamicTableToObj = row => ({
  myTargetId: parseInt(row[0]),
  impressionsLimit: row[1] ? parseInt(row[1].replace(/\,/g, '')) : null,
  ctr: row[2] ? parseFloat(row[2]) : null,
  preview: row[3] || null
})

const getStaticAdminDataFromSheet = auth =>
  new bb((resolve, reject) =>
    google.sheets('v4').spreadsheets.values.get(
      {
        auth: auth,
        spreadsheetId: process.env.GOOGLE_ADMIN_SPREADSHEET_ID,
        range: 'Static!C2:G'
      },
      (err, response) => {
        if (err) return reject('Google API returned an error: ' + err)
        resolve(map(staticTableToObj, response.values))
      }
    )
  )

const getDynamicAdminDataFromSheet = auth =>
  new bb((resolve, reject) =>
    google.sheets('v4').spreadsheets.values.get(
      {
        auth,
        spreadsheetId: process.env.GOOGLE_ADMIN_SPREADSHEET_ID,
        range: 'Dynamic!B2:E'
      },
      (err, response) => {
        if (err) return reject('Google API returned an error: ' + err)
        resolve(map(dynamicTableToObj, response.values))
      }
    )
  )

const tablizeDynamic = p => [
  `(${p.slotId ? p.slotId : 'слота нет'}) ${p.padName}: ${p.formatName}, CPM: ${
    p.price
  }₽`,
  p.myTargetId,
  p.impressionsLimit,
  p.ctr,
  p.preview
]

const tablizeStatic = p => [
  `(${p.slotId ? p.slotId : 'слота нет'}) ${p.padName} - ${p.positionName}: ${
    p.formatName
  }, ${p.price}₽`,
  p.priceType,
  p.myTargetId,
  p.impressionsPrediction,
  p.coveragePrediction,
  p.ctr,
  p.preview
]

const dynamicPackagesToTableFormat = compose(
  map(tablizeDynamic),
  filter(compose(propEq('formatType', 'dynamic')))
)

const staticPackagesToTableFormat = compose(
  map(tablizeStatic),
  filter(compose(propEq('formatType', 'static')))
)

const storeDynamicAdminDataToSheet = (auth, data) =>
  new bb((resolve, reject) => {
    google.sheets('v4').spreadsheets.values.update(
      {
        auth,
        spreadsheetId: process.env.GOOGLE_ADMIN_SPREADSHEET_ID,
        valueInputOption: 'USER_ENTERED',
        range: 'Dynamic!A2:E',
        resource: { values: dynamicPackagesToTableFormat(data) }
      },
      (err, response) => {
        if (err) return reject('The API returned an error: ' + err)
        resolve(response)
      }
    )
  })

const storeStaticAdminDataToSheet = (auth, data) =>
  new bb((resolve, reject) => {
    google.sheets('v4').spreadsheets.values.update(
      {
        auth,
        spreadsheetId: process.env.GOOGLE_ADMIN_SPREADSHEET_ID,
        valueInputOption: 'USER_ENTERED',
        range: 'Static!A2:G',
        resource: { values: staticPackagesToTableFormat(data) }
      },
      (err, response) => {
        if (err) return reject('The API returned an error: ' + err)
        resolve(response)
      }
    )
  })

const sortByPad = packages =>
  packages.sort((a, b) => {
    const ac = a.padId + a.myTargetId / 1e4,
      bc = b.padId + b.myTargetId / 1e4
    if (ac < bc) return -1
    if (ac > bc) return 1
    return 0
  })

module.exports = {
  getAdminDataFromSheet: async () => {
    const auth = await getAuth()

    return [
      ...(await getStaticAdminDataFromSheet(auth)),
      ...(await getDynamicAdminDataFromSheet(auth))
    ]
  },

  inputDataToSheet: async packages => {
    const auth = await getAuth()
    sortByPad(packages)
    await storeStaticAdminDataToSheet(auth, packages)
    await storeDynamicAdminDataToSheet(auth, packages)
  }
}

require('../../common/lib/dotenv').config(
  [ 'MYTARGET_CLIENTID'
  , 'MYTARGET_SECRET'
  ]
)

const request = require('request-promise')
const { STRING, INTEGER } = require('sequelize')
const endpoint = postfix => `https://target.my.com/api/v2/${postfix}`
const db = require('../../common/lib/db')

db.define('myTargetToken',
  { token: { type: STRING, unique: true }
  , expires: { type: INTEGER }
  , refreshToken: { type: STRING }
  , tokenType: { type: STRING }
  , tokensLeft: { type: INTEGER }
  }
).sync()

const refreshAccessToken = async (clientId, clientSecret, refreshToken) =>
  await request(
    { method: 'POST'
    , uri: endpoint('oauth2/token.json')
    , form:
      { 'client_id': clientId
      , 'client_secret': clientSecret
      , 'refresh_token': refreshToken
      , 'grant_type': 'refresh_token'
      }
    , json: true
    }
  )

db.models.myTargetToken.latestToken = async () =>
  db.models.myTargetToken.findOne(
    { order: [['createdAt', 'DESC']] }
  )

db.models.myTargetToken.getAccessToken = async () => {
  if (!db.models.myTargetToken._accessToken) {
    const accessToken = await db.models.myTargetToken.latestToken()
    db.models.myTargetToken._accessToken = accessToken.token
  }
  return db.models.myTargetToken._accessToken
}

db.models.myTargetToken.refreshAccessToken = async () => {
  const latestToken = await db.models.myTargetToken.latestToken()
  const accessToken = await refreshAccessToken(
      process.env.MYTARGET_CLIENTID,
      process.env.MYTARGET_SECRET,
      latestToken.refreshToken
    )

  await db.models.myTargetToken.create(
    { token: accessToken['access_token']
    , expires: accessToken['expires_in']
    , refreshToken: accessToken['refresh_token']
    , tokenType: accessToken['token_type']
    , tokensLeft: accessToken['tokens_left'] || null
    }
  )

  db.models.myTargetToken._accessToken = accessToken['access_token']
  return db.models.myTargetToken._accessToken
}

module.exports = db.models.myTargetToken

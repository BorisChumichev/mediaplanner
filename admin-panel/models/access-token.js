const { STRING, BIGINT } = require('sequelize')
const db = require('../../common/lib/db')

db.define('googleToken', {
  accessToken: { type: STRING, unique: true },
  expiryDate: { type: BIGINT },
  refreshToken: { type: STRING },
  tokenType: { type: STRING }
}).sync()

db.models.googleToken.latestToken = async () =>
  db.models.googleToken.findOne({ order: [['createdAt', 'DESC']] })

db.models.googleToken.getAccessToken = async () => {
  const token = await db.models.googleToken.latestToken()
  return {
    access_token: token.accessToken,
    expiry_date: token.expiryDate,
    refresh_token: token.refreshToken,
    token_type: token.tokenType
  }
}

module.exports = db.models.googleToken

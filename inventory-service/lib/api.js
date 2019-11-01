const request = require('request-promise'),
  AccessToken = require('../models/access-token')

const endpoint = postfix => `https://target.my.com/api/v2/${postfix}`

const getPads = async accessToken =>
  await request({
    method: 'GET',
    uri: endpoint('rbmedia/pads.json'),
    headers: { Authorization: `Bearer ${accessToken}` },
    json: true
  })

const getPositionsForPad = async (accessToken, padId) =>
  await request({
    method: 'GET',
    uri: endpoint(`rbmedia/pads/${padId}/positions.json`),
    headers: { Authorization: `Bearer ${accessToken}` },
    json: true
  })

const getFormatsForPosition = async (accessToken, positionId) =>
  await request({
    method: 'GET',
    uri: endpoint(`rbmedia/positions/${positionId}/formats.json`),
    headers: { Authorization: `Bearer ${accessToken}` },
    json: true
  })

const getPackagesForFormat = async (accessToken, formatId) =>
  await request({
    method: 'GET',
    uri: endpoint(`rbmedia/formats/${formatId}/packages.json`),
    headers: { Authorization: `Bearer ${accessToken}` },
    json: true
  })

const makeCall = method => async id => {
  const accessToken = await AccessToken.getAccessToken()
  try {
    return await method.apply(null, [accessToken, id])
  } catch (e) {
    if (e.statusCode === 401) {
      const accessToken = await AccessToken.refreshAccessToken()
      return await method.apply(null, [accessToken, id])
    } else {
      console.log(e)
    }
  }
}

module.exports = {
  getPads: makeCall(getPads),
  getPositionsForPad: makeCall(getPositionsForPad),
  getFormatsForPosition: makeCall(getFormatsForPosition),
  getPackagesForFormat: makeCall(getPackagesForFormat)
}
